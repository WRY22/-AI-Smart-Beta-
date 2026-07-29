import {
  createId,
  ensureDatabaseSchema,
  getDb,
  jsonError,
  normalizePortfolioName,
  nowIso,
  portfolioNameError,
  requireUser,
} from "../_lib/auth";

const RECENT_DAYS = 7;

export async function GET(request: Request) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    await cleanupExpiredRuns(user.id);

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "saved" ? "saved" : "recent";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize") ?? 6)));
    const offset = (page - 1) * pageSize;
    const where =
      mode === "saved"
        ? "user_id = ? AND is_saved = 1"
        : "user_id = ? AND is_saved = 0 AND expires_at IS NOT NULL AND expires_at > ?";
    const bindings = mode === "saved" ? [user.id] : [user.id, nowIso()];
    const db = getDb();
    const countRow = await db
      .prepare(`SELECT COUNT(*) as total FROM portfolio_runs WHERE ${where}`)
      .bind(...bindings)
      .first<{ total: number }>();
    const rows = await db
      .prepare(
        `SELECT id, name, is_saved as isSaved, portfolio_type as portfolioType, conditions, factor_weights as factorWeights,
          allocation_settings as allocationSettings, candidate_only as candidateOnly,
          candidate_tickers as candidateTickers, result, created_at as createdAt, updated_at as updatedAt, expires_at as expiresAt
         FROM portfolio_runs
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...bindings, pageSize, offset)
      .all();
    const total = countRow?.total ?? 0;
    return Response.json({
      items: (rows.results ?? []).map(parseRunRow),
      mode,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Load portfolio runs failed", error);
    return jsonError("目前無法讀取投資組合紀錄，請稍後再試。", 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    const payload = (await request.json()) as {
      name?: string;
      isSaved?: boolean;
      clientRequestId?: string;
      portfolioType?: string;
      conditions?: unknown;
      factorWeights?: unknown;
      allocationSettings?: unknown;
      candidateOnly?: boolean;
      candidateTickers?: string[];
      result?: unknown;
    };
    if (!payload.portfolioType || !payload.conditions || !payload.factorWeights || !payload.allocationSettings || !payload.result) {
      return jsonError("投資組合紀錄資料不完整，無法保存。");
    }
    const createdAt = nowIso();
    const fallbackName = defaultPortfolioName(payload.portfolioType, createdAt);
    const name = normalizePortfolioName(payload.name, fallbackName);
    const nameError = portfolioNameError(name);
    if (nameError) return jsonError(nameError);

    const db = getDb();
    const clientRequestId = validClientRequestId(payload.clientRequestId) ? payload.clientRequestId : createId("req");
    const existing = await db
      .prepare(
        `SELECT id, name, is_saved as isSaved, portfolio_type as portfolioType, conditions, factor_weights as factorWeights,
          allocation_settings as allocationSettings, candidate_only as candidateOnly, candidate_tickers as candidateTickers,
          result, created_at as createdAt, updated_at as updatedAt, expires_at as expiresAt
         FROM portfolio_runs WHERE user_id = ? AND client_request_id = ?`,
      )
      .bind(user.id, clientRequestId)
      .first<Record<string, unknown>>();
    if (existing) return Response.json({ id: existing.id, run: parseRunRow(existing), reused: true }, { status: 200 });

    const isSaved = Boolean(payload.isSaved);
    const expiresAt = isSaved ? null : new Date(Date.parse(createdAt) + RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const id = createId("run");
    await db
      .prepare(
        `INSERT INTO portfolio_runs
         (id, user_id, name, is_saved, portfolio_type, conditions, factor_weights, allocation_settings,
          candidate_only, candidate_tickers, result, created_at, updated_at, expires_at, client_request_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        user.id,
        name,
        isSaved ? 1 : 0,
        payload.portfolioType,
        JSON.stringify(payload.conditions),
        JSON.stringify(payload.factorWeights),
        JSON.stringify(payload.allocationSettings),
        payload.candidateOnly ? 1 : 0,
        JSON.stringify(payload.candidateTickers ?? []),
        JSON.stringify(payload.result),
        createdAt,
        createdAt,
        expiresAt,
        clientRequestId,
      )
      .run();
    return Response.json({ id, name, isSaved, expiresAt }, { status: 201 });
  } catch (error) {
    console.error("Save portfolio run failed", error);
    return jsonError("結果已產生，但暫時無法儲存，請稍後重試。", 500);
  }
}

export function parseRunRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    isSaved: Boolean(row.isSaved),
    portfolioType: row.portfolioType,
    conditions: parseJson(row.conditions),
    factorWeights: parseJson(row.factorWeights),
    allocationSettings: parseJson(row.allocationSettings),
    candidateOnly: Boolean(row.candidateOnly),
    candidateTickers: parseJson(row.candidateTickers),
    result: parseJson(row.result),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
  };
}

export function defaultPortfolioName(portfolioType: string, iso = nowIso()) {
  return `${portfolioType}－${new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export async function cleanupExpiredRuns(userId: string) {
  await getDb()
    .prepare("DELETE FROM portfolio_runs WHERE user_id = ? AND is_saved = 0 AND expires_at IS NOT NULL AND expires_at <= ?")
    .bind(userId, nowIso())
    .run();
}

function validClientRequestId(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_.:-]{8,80}$/.test(value);
}

function parseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

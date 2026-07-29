import { createId, ensureDatabaseSchema, getDb, jsonError, nowIso, requireUser } from "../_lib/auth";

export async function GET(request: Request) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize") ?? 6)));
    const offset = (page - 1) * pageSize;
    const db = getDb();
    const countRow = await db
      .prepare("SELECT COUNT(*) as total FROM portfolio_runs WHERE user_id = ?")
      .bind(user.id)
      .first<{ total: number }>();
    const rows = await db
      .prepare(
        `SELECT id, portfolio_type as portfolioType, conditions, factor_weights as factorWeights,
          allocation_settings as allocationSettings, candidate_only as candidateOnly,
          candidate_tickers as candidateTickers, result, created_at as createdAt
         FROM portfolio_runs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(user.id, pageSize, offset)
      .all();
    const total = countRow?.total ?? 0;
    return Response.json({
      items: (rows.results ?? []).map(parseRunRow),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Load portfolio runs failed", error);
    return jsonError("目前無法讀取投資組合歷史紀錄，請稍後再試。", 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    const payload = (await request.json()) as {
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
    const id = createId("run");
    await getDb()
      .prepare(
        `INSERT INTO portfolio_runs
         (id, user_id, portfolio_type, conditions, factor_weights, allocation_settings, candidate_only, candidate_tickers, result, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        user.id,
        payload.portfolioType,
        JSON.stringify(payload.conditions),
        JSON.stringify(payload.factorWeights),
        JSON.stringify(payload.allocationSettings),
        payload.candidateOnly ? 1 : 0,
        JSON.stringify(payload.candidateTickers ?? []),
        JSON.stringify(payload.result),
        nowIso(),
      )
      .run();
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Save portfolio run failed", error);
    return jsonError("目前無法保存投資組合紀錄，請稍後再試。", 500);
  }
}

function parseRunRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    portfolioType: row.portfolioType,
    conditions: parseJson(row.conditions),
    factorWeights: parseJson(row.factorWeights),
    allocationSettings: parseJson(row.allocationSettings),
    candidateOnly: Boolean(row.candidateOnly),
    candidateTickers: parseJson(row.candidateTickers),
    result: parseJson(row.result),
    createdAt: row.createdAt,
  };
}

function parseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

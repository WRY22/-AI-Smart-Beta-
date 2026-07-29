import { getDb, jsonError, requireUser } from "../../_lib/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const { id } = await context.params;
  const row = await getDb()
    .prepare(
      `SELECT id, portfolio_type as portfolioType, conditions, factor_weights as factorWeights,
        allocation_settings as allocationSettings, candidate_only as candidateOnly,
        candidate_tickers as candidateTickers, result, created_at as createdAt
       FROM portfolio_runs WHERE id = ? AND user_id = ?`,
    )
    .bind(id, user.id)
    .first<Record<string, unknown>>();
  if (!row) return jsonError("找不到這筆投資組合紀錄，或您沒有權限查看。", 404);
  return Response.json({ run: parseRunRow(row) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const { id } = await context.params;
  await getDb().prepare("DELETE FROM portfolio_runs WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  return Response.json({ ok: true });
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

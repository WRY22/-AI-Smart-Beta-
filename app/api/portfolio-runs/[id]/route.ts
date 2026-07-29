import { ensureDatabaseSchema, getDb, jsonError, normalizePortfolioName, portfolioNameError, requireUser } from "../../_lib/auth";
import { cleanupExpiredRuns, parseRunRow } from "../route";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    await cleanupExpiredRuns(user.id);
    const { id } = await context.params;
    const row = await selectOwnedRun(id, user.id);
    if (!row) return jsonError("找不到這筆投資組合紀錄，或您沒有權限查看。", 404);
    return Response.json({ run: parseRunRow(row) });
  } catch (error) {
    console.error("Load portfolio run failed", error);
    return jsonError("目前無法讀取這筆投資組合紀錄，請稍後再試。", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    const { id } = await context.params;
    const payload = (await request.json()) as { name?: string; isSaved?: boolean };
    const existing = await selectOwnedRun(id, user.id);
    if (!existing) return jsonError("找不到這筆投資組合紀錄，或您沒有權限修改。", 404);
    const currentName = typeof existing.name === "string" && existing.name ? existing.name : "未命名投資組合";
    const nextName = normalizePortfolioName(payload.name, currentName);
    const nameError = portfolioNameError(nextName);
    if (nameError) return jsonError(nameError);

    const saveClause = payload.isSaved
      ? ", is_saved = 1, expires_at = NULL"
      : "";
    await getDb()
      .prepare(`UPDATE portfolio_runs SET name = ?, updated_at = ?${saveClause} WHERE id = ? AND user_id = ?`)
      .bind(nextName, new Date().toISOString(), id, user.id)
      .run();
    const row = await selectOwnedRun(id, user.id);
    return Response.json({ run: row ? parseRunRow(row) : null });
  } catch (error) {
    console.error("Update portfolio run failed", error);
    return jsonError("目前無法更新這筆投資組合紀錄，請稍後再試。", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSchema();
    const { user, response } = await requireUser(request);
    if (!user) return response;
    const { id } = await context.params;
    await getDb().prepare("DELETE FROM portfolio_runs WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Delete portfolio run failed", error);
    return jsonError("目前無法刪除這筆投資組合紀錄，請稍後再試。", 500);
  }
}

function selectOwnedRun(id: string, userId: string) {
  return getDb()
    .prepare(
      `SELECT id, name, is_saved as isSaved, portfolio_type as portfolioType, conditions, factor_weights as factorWeights,
        allocation_settings as allocationSettings, candidate_only as candidateOnly,
        candidate_tickers as candidateTickers, result, created_at as createdAt, updated_at as updatedAt, expires_at as expiresAt
       FROM portfolio_runs
       WHERE id = ? AND user_id = ? AND (is_saved = 1 OR expires_at IS NULL OR expires_at > ?)`,
    )
    .bind(id, userId, new Date().toISOString())
    .first<Record<string, unknown>>();
}

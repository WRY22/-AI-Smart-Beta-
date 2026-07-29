import { createId, getDb, isValidTicker, jsonError, nowIso, requireUser } from "../_lib/auth";

export async function GET(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const rows = await getDb()
    .prepare("SELECT ticker, created_at as createdAt FROM candidate_stocks WHERE user_id = ? ORDER BY created_at ASC")
    .bind(user.id)
    .all<{ ticker: string; createdAt: string }>();
  return Response.json({ candidates: rows.results ?? [] });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const payload = (await request.json()) as { tickers?: string[] };
  const tickers = Array.from(new Set((payload.tickers ?? []).map((ticker) => ticker.trim().toUpperCase())));
  if (tickers.some((ticker) => !isValidTicker(ticker))) return jsonError("候選股票代碼格式不正確。");
  const db = getDb();
  const createdAt = nowIso();
  for (const ticker of tickers) {
    await db
      .prepare("INSERT OR IGNORE INTO candidate_stocks (id, user_id, ticker, created_at) VALUES (?, ?, ?, ?)")
      .bind(createId("can"), user.id, ticker, createdAt)
      .run();
  }
  return GET(request);
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response;
  const url = new URL(request.url);
  const ticker = url.searchParams.get("ticker")?.trim().toUpperCase();
  if (ticker) {
    if (!isValidTicker(ticker)) return jsonError("候選股票代碼格式不正確。");
    await getDb().prepare("DELETE FROM candidate_stocks WHERE user_id = ? AND ticker = ?").bind(user.id, ticker).run();
  } else {
    await getDb().prepare("DELETE FROM candidate_stocks WHERE user_id = ?").bind(user.id).run();
  }
  return Response.json({ ok: true });
}

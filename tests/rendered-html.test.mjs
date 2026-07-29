import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../app/page.tsx", import.meta.url);
const authPath = new URL("../app/api/_lib/auth.ts", import.meta.url);
const runsPath = new URL("../app/api/portfolio-runs/route.ts", import.meta.url);
const migrationPath = new URL("../drizzle/0001_zippy_sandman.sql", import.meta.url);

test("portfolio builder exposes the localized save flow", async () => {
  const page = await readFile(pagePath, "utf8");

  assert.match(page, /產生投資組合/);
  assert.match(page, /產生後儲存至歷史紀錄/);
  assert.match(page, /投資組合名稱/);
  assert.match(page, /近期結果/);
  assert.match(page, /已儲存/);
  assert.match(page, /註冊新帳號/);
  assert.match(page, /使用者名稱或電子信箱/);
  assert.match(page, /<EyeIcon off=\{visible\} \/>/);
});

test("auth and portfolio persistence keep schema and cookies compatible", async () => {
  const [auth, runs, migration] = await Promise.all([
    readFile(authPath, "utf8"),
    readFile(runsPath, "utf8"),
    readFile(migrationPath, "utf8"),
  ]);

  assert.match(auth, /decodeURIComponent\(value\)/);
  assert.match(auth, /Max-Age=/);
  assert.match(auth, /ensureColumn\("users", "username", "text"\)/);
  assert.match(auth, /CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique/);
  assert.match(runs, /clientRequestId/);
  assert.match(runs, /isSaved/);
  assert.match(runs, /cleanupExpiredRuns/);
  assert.match(migration, /UPDATE `users` SET `username` = `id`/);
});

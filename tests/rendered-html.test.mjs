import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../app/page.tsx", import.meta.url);
const authPath = new URL("../app/api/_lib/auth.ts", import.meta.url);
const registerPath = new URL("../app/api/auth/register/route.ts", import.meta.url);
const runsPath = new URL("../app/api/portfolio-runs/route.ts", import.meta.url);
const migrationPath = new URL("../drizzle/0001_zippy_sandman.sql", import.meta.url);
const authSafetyMigrationPath = new URL("../drizzle/0003_auth_session_safety.sql", import.meta.url);
const vitePath = new URL("../vite.config.ts", import.meta.url);

test("portfolio builder exposes the localized save flow", async () => {
  const page = await readFile(pagePath, "utf8");

  assert.match(page, /產生投資組合/);
  assert.match(page, /產生後儲存至歷史紀錄/);
  assert.match(page, /投資組合名稱/);
  assert.match(page, /近期結果/);
  assert.match(page, /已儲存/);
  assert.doesNotMatch(page, /註冊新帳號/);
  assert.match(page, /使用者名稱或電子信箱/);
  assert.match(page, /<EyeIcon off=\{visible\} \/>/);
  assert.match(page, /function normalizeWeightsToTotal/);
  assert.match(page, /function weightAvailability/);
  assert.match(page, /className="weight-status-total"/);
  assert.match(page, /className="weight-status-guidance"/);
  assert.match(page, /step=\{5\}/);
  assert.match(page, /\[0, 25, 50, 75, 100\]/);
  assert.match(page, /--range-progress/);
});

test("auth and portfolio persistence keep schema and cookies compatible", async () => {
  const [auth, register, runs, migration, authSafetyMigration, vite] = await Promise.all([
    readFile(authPath, "utf8"),
    readFile(registerPath, "utf8"),
    readFile(runsPath, "utf8"),
    readFile(migrationPath, "utf8"),
    readFile(authSafetyMigrationPath, "utf8"),
    readFile(vitePath, "utf8"),
  ]);

  assert.match(auth, /decodeURIComponent\(value\)/);
  assert.match(auth, /Max-Age=/);
  assert.match(auth, /ensureColumn\("users", "username", "text"\)/);
  assert.match(auth, /export async function ensureAuthSchema/);
  assert.match(auth, /CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique/);
  assert.match(runs, /clientRequestId/);
  assert.match(runs, /isSaved/);
  assert.match(runs, /cleanupExpiredRuns/);
  assert.match(migration, /UPDATE `users` SET `username` = `id`/);
  assert.match(register, /目前無法建立帳號。請稍後再試。/);
  assert.match(register, /await db\.batch\(/);
  assert.doesNotMatch(register, /查看 Cloudflare Logs/);
  assert.match(auth, /sessions_token_hash_idx/);
  assert.match(auth, /const PASSWORD_ITERATIONS = 100000/);
  assert.match(auth, /iterationCount > PASSWORD_ITERATIONS/);
  assert.match(auth, /Priority=High/);
  assert.match(authSafetyMigration, /users_username_required_insert/);
  assert.match(authSafetyMigration, /sessions_token_hash_idx/);
  assert.doesNotMatch(vite, /00000000-0000-4000-8000-000000000000/);
});

test("welcome layout and market center replace the floating candidate entry", async () => {
  const [page, css] = await Promise.all([readFile(pagePath, "utf8"), readFile(new URL("../app/globals.css", import.meta.url), "utf8")]);

  assert.match(page, /用簡單的方式，建立適合自己的投資組合/);
  assert.match(page, /以訪客身分使用/);
  assert.match(page, /smartBetaEntered/);
  assert.match(page, /市場探索中心/);
  assert.match(page, /了解選股因子/);
  assert.match(page, /查看因子介紹/);
  assert.match(page, /查看候選股票/);
  assert.match(page, /role="tablist" aria-label="市場探索分類"/);
  assert.match(page, /function InfoTag/);
  assert.doesNotMatch(page, /mobile-nav-layer/);
  assert.match(page, /aria-label=\{mobileNavOpen \? "收合功能選單" : "展開功能選單"\}/);
  assert.match(page, /window\.matchMedia\("\(max-width: 820px\)"\)/);
  assert.match(page, /const navigate = \(next: View\) => \{[\s\S]*setMobileNavOpen\(false\)/);
  assert.match(page, /event\.key !== "Escape"[\s\S]*setMobileNavOpen\(false\)/);
  for (const label of ["首頁", "股票探索", "建立投資組合", "結果", "系統說明"]) {
    assert.match(page, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(page, /可點擊/);
  assert.match(page, /openMarketDrawer\("candidates"\)/);
  assert.doesNotMatch(page, /candidate-fab/);
  assert.doesNotMatch(css, /candidate-fab/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.mobile-nav\.open/);
  assert.doesNotMatch(css, /\.mobile-nav-layer/);
  assert.doesNotMatch(css, /mobile-nav-in/);
  assert.match(css, /grid-column: 1 \/ -1/);
  assert.match(css, /width: 100%/);
  assert.match(css, /height: auto/);
  assert.match(css, /overflow: visible/);
  assert.match(css, /@keyframes mobile-nav-expand/);
  assert.doesNotMatch(css, /\.topbar\.mobile-menu-open\s*\{\s*position: relative/);
  assert.match(css, /\.topbar\.mobile-menu-open ~ \.main \.stepper\s*\{[\s\S]*top: 454px/);
  assert.match(css, /\.weight-status\s*\{[\s\S]*min-height: 120px/);
  assert.match(css, /\.weight-slider-control input\[type="range"\][\s\S]*min-height: 44px/);
  assert.match(css, /background: transparent/);
  assert.match(css, /::-webkit-slider-thumb[\s\S]*background: var\(--brand\)/);
  assert.match(css, /::-moz-range-progress/);
  assert.match(css, /::-moz-range-thumb[\s\S]*background: var\(--brand\)/);
  const mobileNavStart = page.indexOf('<nav id="mobile-nav"');
  const mobileNavEnd = page.indexOf("</nav>", mobileNavStart);
  const mobileNavMarkup = page.slice(mobileNavStart, mobileNavEnd);
  assert.doesNotMatch(mobileNavMarkup, /登入|註冊/);
  assert.match(css, /\.mobile-nav button\s*\{[\s\S]*min-height: 46px/);
  assert.match(css, /\.preset\s*\{[\s\S]*justify-content: flex-start;[\s\S]*align-items: flex-start;[\s\S]*color: var\(--ink\);/);
  assert.match(css, /\.preset strong\s*\{[\s\S]*color: var\(--ink\);/);
  assert.match(css, /--row-hover: #162a24/);
  assert.match(css, /background: var\(--row-hover\)/);
  assert.doesNotMatch(css, /tbody tr:hover\s*\{\s*background: #f7faf8/);
  assert.doesNotMatch(css, /background: #eef5f2/);
});

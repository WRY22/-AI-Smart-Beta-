import { env } from "cloudflare:workers";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  token: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

const SESSION_COOKIE = "smart_beta_session";
const SESSION_DAYS = 14;
const PASSWORD_ITERATIONS = 100000;

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function getDb() {
  if (!env.DB) throw new Error("資料庫尚未啟用，請確認 D1 綁定 DB 已部署。");
  return env.DB;
}

export async function ensureDatabaseSchema() {
  const db = getDb();
  await ensureAuthSchema();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS candidate_stocks (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        ticker text NOT NULL,
        created_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    )
    .run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS candidate_user_ticker_unique ON candidate_stocks (user_id, ticker)").run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portfolio_runs (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        name text,
        is_saved integer NOT NULL DEFAULT 1,
        portfolio_type text NOT NULL,
        conditions text NOT NULL,
        factor_weights text NOT NULL,
        allocation_settings text NOT NULL,
        candidate_only integer NOT NULL,
        candidate_tickers text NOT NULL,
        result text NOT NULL,
        created_at text NOT NULL,
        updated_at text,
        expires_at text,
        client_request_id text,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    )
    .run();
  await ensureColumn("users", "username", "text");
  await ensureColumn("portfolio_runs", "name", "text");
  await ensureColumn("portfolio_runs", "is_saved", "integer NOT NULL DEFAULT 1");
  await ensureColumn("portfolio_runs", "updated_at", "text");
  await ensureColumn("portfolio_runs", "expires_at", "text");
  await ensureColumn("portfolio_runs", "client_request_id", "text");
  await db.prepare("UPDATE portfolio_runs SET name = portfolio_type || '－' || substr(created_at, 1, 10) WHERE name IS NULL OR name = ''").run();
  await db.prepare("UPDATE portfolio_runs SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = ''").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS portfolio_runs_user_client_request_unique ON portfolio_runs (user_id, client_request_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS portfolio_runs_user_saved_created_idx ON portfolio_runs (user_id, is_saved, created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS portfolio_runs_user_expires_idx ON portfolio_runs (user_id, expires_at)").run();
}

export async function ensureAuthSchema() {
  const db = getDb();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        username text,
        email text NOT NULL,
        display_name text NOT NULL,
        password_hash text NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )`,
    )
    .run();
  await ensureColumn("users", "username", "text");
  await db.prepare("UPDATE users SET username = id WHERE username IS NULL OR username = ''").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)").run();
  await db
    .prepare(
      `CREATE TRIGGER IF NOT EXISTS users_username_required_insert
       BEFORE INSERT ON users
       WHEN NEW.username IS NULL OR trim(NEW.username) = ''
       BEGIN
         SELECT RAISE(ABORT, 'username_required');
       END`,
    )
    .run();
  await db
    .prepare(
      `CREATE TRIGGER IF NOT EXISTS users_username_required_update
       BEFORE UPDATE OF username ON users
       WHEN NEW.username IS NULL OR trim(NEW.username) = ''
       BEGIN
         SELECT RAISE(ABORT, 'username_required');
       END`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        token_hash text NOT NULL,
        created_at text NOT NULL,
        expires_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions (token_hash)").run();
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function usernameError(username: string) {
  if (!username) return "請輸入使用者名稱。";
  if (username.length < 3 || username.length > 20) return "使用者名稱需為 3 至 20 個字元。";
  if (!/^[\p{Script=Han}A-Za-z0-9_]+$/u.test(username)) return "使用者名稱只能使用中文、英文字母、數字及底線。";
  return "";
}

export function normalizePortfolioName(value: unknown, fallback: string) {
  const name = typeof value === "string" ? value.trim() : "";
  return name || fallback;
}

export function portfolioNameError(name: string) {
  if (!name.trim()) return "投資組合名稱不可空白。";
  if (name.length > 50) return "投資組合名稱最多 50 個字元。";
  if (/[\u0000-\u001F\u007F]/.test(name)) return "投資組合名稱不可包含控制字元。";
  return "";
}

export function isValidTicker(value: string) {
  return /^[0-9A-Z.-]{1,12}$/.test(value);
}

export function passwordRuleErrors(password: string) {
  const errors: string[] = [];
  if (password.trim().length === 0) errors.push("密碼不可只由空白組成。");
  if (password.length < 8) errors.push("密碼至少需要 8 個字元。");
  if (!/[A-Za-z]/.test(password)) errors.push("密碼至少需要包含 1 個英文字母。");
  if (!/[0-9]/.test(password)) errors.push("密碼至少需要包含 1 個數字。");
  return errors;
}

export async function hashPassword(password: string, salt = randomBase64(16)) {
  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(salt),
      iterations: PASSWORD_ITERATIONS,
    },
    key,
    256,
  );
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${salt}$${bytesToBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2_sha256" || !iterations || !salt || !hash) return false;
  const iterationCount = Number(iterations);
  if (!Number.isSafeInteger(iterationCount) || iterationCount < 1 || iterationCount > PASSWORD_ITERATIONS) return false;
  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(salt),
      iterations: iterationCount,
    },
    key,
    256,
  );
  return constantTimeEqual(bytesToBase64(new Uint8Array(bits)), hash);
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", utf8(token));
  return bytesToBase64(new Uint8Array(digest));
}

export async function createSessionRecord(userId: string): Promise<SessionRecord> {
  const token = randomBase64(32);
  const tokenHash = await hashToken(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return { id: createId("ses"), userId, token, tokenHash, createdAt, expiresAt };
}

export async function createSession(userId: string) {
  const db = getDb();
  const session = await createSessionRecord(userId);
  await db
    .prepare("INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(session.id, session.userId, session.tokenHash, session.createdAt, session.expiresAt)
    .run();
  return { token: session.token, expiresAt: session.expiresAt };
}

function secureCookieSuffix(requestUrl?: string) {
  if (!requestUrl) return " Secure;";
  try {
    return new URL(requestUrl).protocol === "https:" ? " Secure;" : "";
  } catch {
    return " Secure;";
  }
}

export function sessionCookie(token: string, expiresAt: string, requestUrl?: string) {
  const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Priority=High; Max-Age=${maxAge};${secureCookieSuffix(requestUrl)} Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookie(requestUrl?: string) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Priority=High;${secureCookieSuffix(requestUrl)} Max-Age=0`;
}

export async function getCurrentUser(request: Request): Promise<SessionUser | null> {
  const token = getCookie(request.headers.get("cookie") ?? "", SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await getDb()
    .prepare(
      `SELECT users.id, users.email, users.display_name as displayName, users.created_at as createdAt
       , users.username as username
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .bind(tokenHash, nowIso())
    .first<SessionUser>();
  return row ?? null;
}

export async function requireUser(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return { user: null, response: jsonError("請先登入後再使用此功能。", 401) };
  return { user, response: null };
}

export async function destroyCurrentSession(request: Request) {
  const token = getCookie(request.headers.get("cookie") ?? "", SESSION_COOKIE);
  if (!token) return;
  await getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
}

function getCookie(cookieHeader: string, name: string) {
  const value = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function randomBase64(byteLength: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return bytesToBase64(bytes);
}

function utf8(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

async function ensureColumn(table: string, column: string, definition: string) {
  const db = getDb();
  const columns = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  if ((columns.results ?? []).some((row) => row.name === column)) return;
  await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
}

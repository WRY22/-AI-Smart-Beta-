import { env } from "cloudflare:workers";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

const SESSION_COOKIE = "smart_beta_session";
const SESSION_DAYS = 14;
const PASSWORD_ITERATIONS = 120000;

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function getDb() {
  if (!env.DB) throw new Error("資料庫尚未啟用，請確認 D1 綁定 DB 已部署。");
  return env.DB;
}

export async function ensureDatabaseSchema() {
  const db = getDb();
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        email text NOT NULL,
        display_name text NOT NULL,
        password_hash text NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )`,
    ),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)"),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        token_hash text NOT NULL,
        created_at text NOT NULL,
        expires_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS candidate_stocks (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        ticker text NOT NULL,
        created_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    ),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS candidate_user_ticker_unique ON candidate_stocks (user_id, ticker)"),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS portfolio_runs (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        portfolio_type text NOT NULL,
        conditions text NOT NULL,
        factor_weights text NOT NULL,
        allocation_settings text NOT NULL,
        candidate_only integer NOT NULL,
        candidate_tickers text NOT NULL,
        result text NOT NULL,
        created_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    ),
  ]);
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
  const key = await crypto.subtle.importKey("raw", utf8(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64ToBytes(salt),
      iterations: Number(iterations),
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

export async function createSession(userId: string) {
  const db = getDb();
  const token = randomBase64(32);
  const tokenHash = await hashToken(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)")
    .bind(createId("ses"), userId, tokenHash, createdAt, expiresAt)
    .run();
  return { token, expiresAt };
}

export function sessionCookie(token: string, expiresAt: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export async function getCurrentUser(request: Request): Promise<SessionUser | null> {
  const token = getCookie(request.headers.get("cookie") ?? "", SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await getDb()
    .prepare(
      `SELECT users.id, users.email, users.display_name as displayName, users.created_at as createdAt
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
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
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

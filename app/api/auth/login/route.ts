import { createSession, ensureDatabaseSchema, getDb, jsonError, normalizeEmail, sessionCookie, verifyPassword } from "../../_lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    const identity = typeof payload.email === "string" ? payload.email.trim() : "";
    const email = normalizeEmail(identity);
    const password = payload.password ?? "";
    await ensureDatabaseSchema();
    const user = await getDb()
      .prepare(
        `SELECT id, username, email, display_name as displayName, password_hash as passwordHash, created_at as createdAt
         FROM users WHERE email = ? OR username = ?`,
      )
      .bind(email, identity)
      .first<{ id: string; username: string; email: string; displayName: string; passwordHash: string; createdAt: string }>();
    if (!user || !(await verifyPassword(password, user.passwordHash))) return jsonError("使用者名稱、電子信箱或密碼不正確。", 401);
    const session = await createSession(user.id);
    return Response.json(
      { user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, createdAt: user.createdAt } },
      { headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt, request.url) } },
    );
  } catch (error) {
    console.error("Login failed", error);
    return jsonError("目前無法登入，請稍後再試。", 500);
  }
}

import {
  createId,
  createSession,
  getDb,
  hashPassword,
  isValidEmail,
  jsonError,
  normalizeEmail,
  nowIso,
  sessionCookie,
} from "../../_lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      displayName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
    const displayName = payload.displayName?.trim() ?? "";
    const email = normalizeEmail(payload.email);
    const password = payload.password ?? "";
    const confirmPassword = payload.confirmPassword ?? "";
    if (!displayName) return jsonError("請輸入使用者名稱。");
    if (!isValidEmail(email)) return jsonError("請輸入有效的電子郵件。");
    if (password.length < 8) return jsonError("密碼至少需要 8 個字元。");
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return jsonError("密碼需同時包含英文字母與數字。");
    if (password !== confirmPassword) return jsonError("確認密碼與密碼不一致。");

    const db = getDb();
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return jsonError("這個電子郵件已經註冊。", 409);

    const userId = createId("usr");
    const createdAt = nowIso();
    await db
      .prepare(
        "INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(userId, email, displayName, await hashPassword(password), createdAt, createdAt)
      .run();
    const session = await createSession(userId);
    return Response.json(
      { user: { id: userId, email, displayName, createdAt } },
      { status: 201, headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt) } },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "註冊失敗，請稍後再試。", 500);
  }
}

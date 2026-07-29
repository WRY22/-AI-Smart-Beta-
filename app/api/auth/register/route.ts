import {
  createId,
  createSession,
  ensureDatabaseSchema,
  getDb,
  hashPassword,
  isValidEmail,
  jsonError,
  normalizeEmail,
  normalizeUsername,
  nowIso,
  passwordRuleErrors,
  sessionCookie,
  usernameError,
} from "../../_lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      displayName?: string;
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
    const username = normalizeUsername(payload.username ?? payload.displayName);
    const displayName = username;
    const email = normalizeEmail(payload.email);
    const password = payload.password ?? "";
    const confirmPassword = payload.confirmPassword ?? "";
    const nameError = usernameError(username);
    if (nameError) return jsonError(nameError);
    if (!isValidEmail(email)) return jsonError("請輸入有效的電子郵件。");
    const passwordErrors = passwordRuleErrors(password);
    if (passwordErrors.length) return jsonError(passwordErrors[0]);
    if (password !== confirmPassword) return jsonError("兩次輸入的密碼不一致。");

    await ensureDatabaseSchema();
    const db = getDb();
    const existingEmail = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existingEmail) return jsonError("這個電子郵件已經註冊。", 409);
    const existingUsername = await db.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
    if (existingUsername) return jsonError("這個使用者名稱已經有人使用。", 409);

    const userId = createId("usr");
    const createdAt = nowIso();
    await db
      .prepare(
        "INSERT INTO users (id, username, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(userId, username, email, displayName, await hashPassword(password), createdAt, createdAt)
      .run();
    const session = await createSession(userId);
    return Response.json(
      { user: { id: userId, username, email, displayName, createdAt } },
      { status: 201, headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt, request.url) } },
    );
  } catch (error) {
    console.error("Register failed", error);
    return jsonError("目前無法建立帳號，請稍後再試。", 500);
  }
}

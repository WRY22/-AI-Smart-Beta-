import { clearSessionCookie, destroyCurrentSession, ensureDatabaseSchema } from "../../_lib/auth";

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();
    await destroyCurrentSession(request);
  } catch (error) {
    console.error("Logout failed", error);
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(request.url) } });
}

import { clearSessionCookie, destroyCurrentSession } from "../../_lib/auth";

export async function POST(request: Request) {
  await destroyCurrentSession(request);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}

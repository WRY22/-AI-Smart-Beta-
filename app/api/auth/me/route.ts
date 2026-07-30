import { ensureAuthSchema, getCurrentUser } from "../../_lib/auth";

export async function GET(request: Request) {
  try {
    await ensureAuthSchema();
    const user = await getCurrentUser(request);
    return Response.json({ user });
  } catch (error) {
    console.error("Load current user failed", error);
    return Response.json({ user: null });
  }
}

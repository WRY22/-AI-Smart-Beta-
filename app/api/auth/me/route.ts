import { getCurrentUser } from "../../_lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  return Response.json({ user });
}

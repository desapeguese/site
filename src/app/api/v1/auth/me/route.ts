import { authService } from "@/server/auth/auth-service";
import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    const user = await requireAuth(request);
    return Response.json(await authService.me(user.id));
  });
}

import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { usersService } from "@/server/users/users-service";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { id } = await context.params;
    return Response.json(await usersService.findPublicById(id));
  });
}

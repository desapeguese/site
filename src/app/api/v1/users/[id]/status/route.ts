import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { updateUserStatusSchema } from "@/server/users/users-schemas";
import { usersService } from "@/server/users/users-service";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { id } = await context.params;
    const input = await parseJsonBody(request, updateUserStatusSchema);
    return Response.json(await usersService.updateStatus(id, input));
  });
}

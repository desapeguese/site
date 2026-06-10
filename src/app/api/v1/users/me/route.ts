import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { updateProfileSchema } from "@/server/users/users-schemas";
import { usersService } from "@/server/users/users-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    const user = await requireAuth(request);
    return Response.json(await usersService.findPublicById(user.id));
  });
}

export async function PATCH(request: Request) {
  return handleApiRoute(async () => {
    const user = await requireAuth(request);
    const input = await parseJsonBody(request, updateProfileSchema);
    return Response.json(await usersService.updateOwnProfile(user.id, input));
  });
}

import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { createUserSchema, listUsersQuerySchema } from "@/server/users/users-schemas";
import { usersService } from "@/server/users/users-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const query = listUsersQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries())
    );

    return Response.json(await usersService.findAll(query));
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const input = await parseJsonBody(request, createUserSchema);
    return Response.json(await usersService.createUser(input), { status: 201 });
  });
}

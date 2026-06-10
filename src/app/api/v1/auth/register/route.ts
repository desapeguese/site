import { authService } from "@/server/auth/auth-service";
import { registerSchema } from "@/server/auth/auth-schemas";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const input = await parseJsonBody(request, registerSchema);
    return Response.json(await authService.register(input), { status: 201 });
  });
}

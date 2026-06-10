import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { landingService } from "@/server/landing/landing-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    return Response.json(await landingService.restoreDefaultPage());
  });
}

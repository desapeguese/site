import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { landingService } from "@/server/landing/landing-service";
import { upsertLandingAssetSchema } from "@/server/landing/landing-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { id } = await context.params;
    const input = await parseJsonBody(request, upsertLandingAssetSchema);
    return Response.json(await landingService.updateAsset(id, input));
  });
}

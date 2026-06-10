import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { landingService } from "@/server/landing/landing-service";
import { updateLandingSectionSchema } from "@/server/landing/landing-schemas";

type RouteContext = { params: Promise<{ sectionId: string }> };

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { sectionId } = await context.params;
    const input = await parseJsonBody(request, updateLandingSectionSchema);
    return Response.json(await landingService.updateSection(sectionId, input));
  });
}

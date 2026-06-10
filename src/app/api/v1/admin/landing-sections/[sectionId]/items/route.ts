import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { landingService } from "@/server/landing/landing-service";
import { createLandingItemSchema } from "@/server/landing/landing-schemas";

type RouteContext = { params: Promise<{ sectionId: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const { sectionId } = await context.params;
    const input = await parseJsonBody(request, createLandingItemSchema);
    return Response.json(await landingService.createItem(sectionId, input), { status: 201 });
  });
}

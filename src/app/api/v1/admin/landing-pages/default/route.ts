import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { landingService } from "@/server/landing/landing-service";
import { updateLandingPageSchema } from "@/server/landing/landing-schemas";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    const input = await parseJsonBody(request, updateLandingPageSchema);
    return Response.json(await landingService.updateDefaultPage(input));
  });
}

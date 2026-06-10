import { handleApiRoute } from "@/server/http/route-handler";
import { landingService } from "@/server/landing/landing-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handleApiRoute(async () => Response.json(await landingService.getDefaultPage()));
}

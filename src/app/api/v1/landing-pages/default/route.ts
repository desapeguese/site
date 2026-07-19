import { handleApiRoute } from "@/server/http/route-handler";
import { landingService } from "@/server/landing/landing-service";

export const runtime = "nodejs";

export async function GET() {
  return handleApiRoute(async () => {
    const payload = await landingService.getDefaultPage();
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  });
}

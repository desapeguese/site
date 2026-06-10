import { requireAuth } from "@/server/auth/require-auth";
import { csvResponse } from "@/server/http/api-response";
import { handleApiRoute } from "@/server/http/route-handler";
import { exportNewsletterCsv } from "@/server/newsletter/newsletter-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request, "ADMIN");
    return csvResponse("newsletter-festival-desapegue-se.csv", await exportNewsletterCsv());
  });
}

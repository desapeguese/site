import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { assertNewsletterRateLimit } from "@/server/newsletter/newsletter-rate-limit";
import { createNewsletterSubscriptionSchema } from "@/server/newsletter/newsletter-schemas";
import { subscribeNewsletter } from "@/server/newsletter/newsletter-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const input = await parseJsonBody(request, createNewsletterSubscriptionSchema);
    assertNewsletterRateLimit(request, input.email);
    await subscribeNewsletter(input);

    return Response.json(
      {
        message: "Inscrição recebida. Se o email for válido, ele receberá nossas atualizações.",
      },
      { status: 201 }
    );
  });
}

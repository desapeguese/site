import { requireAuth } from "@/server/auth/require-auth";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { createItemSchema, listItemsQuerySchema } from "@/server/items/items-schemas";
import { itemsService } from "@/server/items/items-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleApiRoute(async () => {
    await requireAuth(request);
    const query = listItemsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries())
    );

    return Response.json(await itemsService.findAll(query));
  });
}

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    const user = await requireAuth(request);
    const input = await parseJsonBody(request, createItemSchema);
    return Response.json(await itemsService.create(input, user.id), { status: 201 });
  });
}

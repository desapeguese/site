import { requireAuth } from "@/server/auth/require-auth";
import { emptyResponse } from "@/server/http/api-response";
import { handleApiRoute } from "@/server/http/route-handler";
import { parseJsonBody } from "@/server/http/validation";
import { updateItemSchema } from "@/server/items/items-schemas";
import { itemsService } from "@/server/items/items-service";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request);
    const { id } = await context.params;
    return Response.json(await itemsService.findOne(id));
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request);
    const { id } = await context.params;
    const input = await parseJsonBody(request, updateItemSchema);
    return Response.json(await itemsService.update(id, input));
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleApiRoute(async () => {
    await requireAuth(request);
    const { id } = await context.params;
    await itemsService.remove(id);
    return emptyResponse();
  });
}

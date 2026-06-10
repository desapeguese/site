import { prisma } from "@/server/db/prisma";
import { handleApiRoute } from "@/server/http/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handleApiRoute(async () => {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      service: "festival-desapegue-se-next",
      timestamp: new Date().toISOString(),
    });
  });
}

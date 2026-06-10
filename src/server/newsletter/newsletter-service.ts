import { prisma } from "@/server/db/prisma";
import type { CreateNewsletterSubscriptionInput } from "./newsletter-schemas";

export async function subscribeNewsletter(input: CreateNewsletterSubscriptionInput) {
  const email = input.email.trim().toLowerCase();
  const source = input.source?.trim().toLowerCase() || "footer";

  return prisma.newsletterSubscription.upsert({
    where: { email },
    create: { email, source, isActive: true },
    update: { source, isActive: true },
  });
}

export async function exportNewsletterCsv(): Promise<string> {
  const rows = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });
  const header = ["email", "source", "isActive", "createdAt", "updatedAt"];
  const body = rows.map((row) => [
    row.email,
    row.source,
    String(row.isActive),
    row.createdAt.toISOString(),
    row.updatedAt.toISOString(),
  ]);

  return [header, ...body].map((columns) => columns.map(escapeCsvCell).join(",")).join("\r\n");
}

function escapeCsvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

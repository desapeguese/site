import type { Item } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import type { CreateItemInput, ListItemsQuery, UpdateItemInput } from "./items-schemas";

function toItemPayload(item: Item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    createdById: item.createdById,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function create(input: CreateItemInput, userId: string) {
  const item = await prisma.item.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      createdById: userId,
    },
  });

  return toItemPayload(item);
}

async function findAll(query: ListItemsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const where = query.search
    ? { name: { contains: query.search, mode: "insensitive" as const } }
    : {};
  const [items, totalItems] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items: items.map(toItemPayload),
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

async function findOne(id: string) {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  return toItemPayload(item);
}

async function update(id: string, input: UpdateItemInput) {
  await findOne(id);
  const updated = await prisma.item.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() ?? null } : {}),
    },
  });

  return toItemPayload(updated);
}

async function remove(id: string): Promise<void> {
  await findOne(id);
  await prisma.item.delete({ where: { id } });
}

export const itemsService = {
  create,
  findAll,
  findOne,
  update,
  remove,
};

import type { User } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";
import { hashPassword } from "@/server/auth/password";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateProfileInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from "./users-schemas";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError(409, "Email is already in use.");
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      isActive: input.isActive,
    },
  });

  return toPublicUser(user);
}

async function findPublicById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toPublicUser(user);
}

async function findAll(query: ListUsersQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(query.role ? { role: query.role } : {}),
    ...(typeof query.isActive === "boolean" ? { isActive: query.isActive } : {}),
  };
  const [items, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: items.map(toPublicUser),
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

async function updateOwnProfile(id: string, input: UpdateProfileInput): Promise<PublicUser> {
  const currentUser = await prisma.user.findUnique({ where: { id } });

  if (!currentUser) {
    throw new ApiError(404, "User not found.");
  }

  const email = input.email?.trim().toLowerCase();

  if (email && email !== currentUser.email) {
    const emailOwner = await prisma.user.findUnique({ where: { email } });

    if (emailOwner && emailOwner.id !== id) {
      throw new ApiError(409, "Email is already in use.");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(email ? { email } : {}),
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    },
  });

  return toPublicUser(updated);
}

async function updateRole(id: string, input: UpdateUserRoleInput): Promise<PublicUser> {
  await findPublicById(id);
  const updated = await prisma.user.update({
    where: { id },
    data: { role: input.role },
  });

  return toPublicUser(updated);
}

async function updateStatus(id: string, input: UpdateUserStatusInput): Promise<PublicUser> {
  await findPublicById(id);
  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: input.isActive },
  });

  return toPublicUser(updated);
}

export const usersService = {
  createUser,
  findPublicById,
  findAll,
  updateOwnProfile,
  updateRole,
  updateStatus,
};

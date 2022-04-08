import type { User, AccessUser, AccessPoint } from "@prisma/client";

import { prisma } from "~/db.server";

export type { AccessUser } from "@prisma/client";

// Excludes "deleted" access users.
export function getAccessUser({
  id,
  userId,
}: Pick<AccessUser, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessUser.findFirst({
    where: { id, deletedAt: new Date(0), user: { id: userId } },
    rejectOnNotFound: true,
  });
}

// Excludes "deleted" access users.
export function getAccessUserWithPoints({
  id,
  userId,
}: Pick<AccessUser, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessUser.findFirst({
    where: { id, deletedAt: new Date(0), user: { id: userId } },
    include: {
      accessPoints: {
        orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
        include: { accessHub: true },
      },
    },
    rejectOnNotFound: true,
  });
}

export function getAccessUsers({ userId }: { userId: User["id"] }) {
  return prisma.accessUser.findMany({
    where: { deletedAt: new Date(0), user: { id: userId } },
    orderBy: { name: "asc" },
  });
}

export function createAccessUser({
  name,
  description,
  code,
  userId,
}: Pick<AccessUser, "name" | "description" | "code"> & {
  userId: User["id"];
}) {
  return prisma.accessUser.create({
    data: {
      name,
      description,
      code,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function updateAccessUser({
  id,
  name,
  description,
  code,
  activateCodeAt,
  expireCodeAt,
  userId,
}: Pick<
  AccessUser,
  "id" | "name" | "description" | "code" | "activateCodeAt" | "expireCodeAt"
> & { userId: User["id"] }) {
  const { count } = await prisma.accessUser.updateMany({
    where: { id, user: { id: userId } },
    data: {
      name,
      description,
      code,
      activateCodeAt,
      expireCodeAt,
    },
  });
  if (count === 0) {
    throw new Error("Access user not found");
  }
  return getAccessUser({ id, userId });
}

// Access events maintain references to deleted access users.
export async function markAccessUserAsDeleted({
  id,
  userId,
}: Pick<AccessUser, "id"> & { userId: User["id"] }) {
  // updateMany allows userId in where, but not nested writes.
  const { count } = await prisma.accessUser.updateMany({
    where: { id, user: { id: userId } },
    data: {
      deletedAt: new Date(),
    },
  });
  if (count === 0) {
    throw new Error("Access user not found");
  }
  return prisma.accessUser.update({
    where: { id },
    data: {
      accessPoints: {
        set: [],
      },
    },
  });
}

export async function addPointsToAccessUser({
  id,
  accessPointIds,
  userId,
}: Pick<AccessUser, "id"> & {
  accessPointIds: AccessPoint["id"][];
  userId: User["id"];
}) {
  await getAccessUser({ id, userId });
  return prisma.accessUser.update({
    where: { id },
    data: { accessPoints: { connect: accessPointIds.map((id) => ({ id })) } },
  });
}

export async function removePointFromAccessUser({
  id,
  accessPointId,
  userId,
}: Pick<AccessUser, "id"> & {
  accessPointId: AccessPoint["id"];
  userId: User["id"];
}) {
  await getAccessUser({ id, userId });
  return prisma.accessUser.update({
    where: { id },
    data: {
      accessPoints: { disconnect: { id: accessPointId } },
    },
  });
}

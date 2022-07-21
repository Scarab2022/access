import type { User, AccessHub } from "@prisma/client";

import { prisma } from "~/db.server";

export type { AccessHub } from "@prisma/client";

export function getAccessHub({
  id,
  userId,
}: {
  id: AccessHub["id"];
  userId: User["id"];
}) {
  return prisma.accessHub.findFirstOrThrow({
    where: { id, user: { id: userId } },
  });
}

export function getAccessHubWithPoints({
  id,
  userId,
}: {
  id: AccessHub["id"];
  userId: User["id"];
}) {
  return prisma.accessHub.findFirstOrThrow({
    where: { id, user: { id: userId } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
    },
  });
}

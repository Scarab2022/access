import type { User, AccessPoint } from "@prisma/client";

import { prisma } from "~/db.server";

export type { AccessPoint } from "@prisma/client";

export function getAccessPoint({
  id,
  userId,
}: Pick<AccessPoint, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessPoint.findFirst({
    where: { id, accessHub: { user: { id: userId } } },
    rejectOnNotFound: true,
  });
}

export function getAccessPointWithHubAndUsers({
  id,
  userId,
}: Pick<AccessPoint, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessPoint.findFirst({
    where: {
      id,
      accessHub: { user: { id: userId } },
    },
    include: {
      accessHub: true,
      accessUsers: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
}

import type { User, AccessHub } from "@prisma/client";

import { prisma } from "~/db.server";

export type { AccessHub } from "@prisma/client";

export function getAccessHub({
  id,
  userId,
}: Pick<AccessHub, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessHub.findFirst({
    where: { id, user: { id: userId } },
    rejectOnNotFound: true,
  });
}

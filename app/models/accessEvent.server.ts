import type { AccessHub } from "@prisma/client";

import { prisma } from "~/db.server";

export type { AccessEvent } from "@prisma/client";

export function getAccessEvents({ accessHubId }: { accessHubId: AccessHub["id"] }) {
  return prisma.accessEvent.findMany({
    where: {
      accessPoint: {
        accessHub: { id: accessHubId },
      },
    },
    orderBy: { at: "desc" },
    include: {
      accessUser: true,
      accessPoint: true,
    },
  });
}

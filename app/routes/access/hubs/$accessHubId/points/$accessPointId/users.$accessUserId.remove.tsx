import { ActionFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { getAccessPoint } from "~/models/accessPoint.server";
import { requireUserIdForRole } from "~/session.server";

export const action: ActionFunction = async ({
  request,
  params: { accessHubId, accessPointId, accessUserId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessHubId, "accessHubId not found");
  invariant(accessPointId, "accessPointId not found");
  invariant(accessUserId, "accessUserId not found");
  const accessPoint = await getAccessPoint({
    id: Number(accessPointId),
    accessHubId,
    userId,
  });
  await prisma.accessPoint.update({
    where: { id: accessPoint.id },
    data: {
      accessUsers: { disconnect: { id: Number(accessUserId) } },
    },
  });
  return redirect(`/access/hubs/${accessHubId}/points/${accessPoint.id}`);
};

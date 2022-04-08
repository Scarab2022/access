import { ActionFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { getAccessPoint } from "~/models/accessPoint.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({
  request,
  params: { accessPointId, accessUserId },
}) => {
  const userId = await requireUserId(request);
  invariant(accessPointId, "accessPointId not found");
  invariant(accessUserId, "accessUserId not found");
  const accessPoint = await getAccessPoint({
    id: Number(accessPointId),
    userId,
  });
  await prisma.accessPoint.update({
    where: { id: accessPoint.id },
    data: {
      accessUsers: { disconnect: { id: Number(accessUserId) } },
    },
  });
  return redirect(`/access/points/${accessPoint.id}`);
};

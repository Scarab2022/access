import { ActionFunction, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { removePointFromAccessUser } from "~/models/accessUser.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({
  request,
  params: { accessUserId, accessPointId },
}) => {
  const userId = await requireUserId(request);
  invariant(accessUserId, "accessUserId not found")
  invariant(accessPointId, "accessPointId not found")

  // await prisma.accessUser.update({
  //   where: { id: Number(accessUserId) },
  //   data: {
  //     accessPoints: { disconnect: { id: Number(accessPointId) } },
  //   },
  // });
  await removePointFromAccessUser({id: Number(accessUserId), accessPointId: Number(accessPointId), userId})
  return redirect(`/access/users/${accessUserId}`);
};

import { AccessHub, User } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Card, Header, Main, Table, Th } from "~/components/lib";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const handle = {
  breadcrumb: "Activity",
};

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
  accessEvents: Awaited<ReturnType<typeof getAccessEvents>>;
};

function getAccessHub({
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

function getAccessEvents({ id }: Pick<AccessHub, "id">) {
  return prisma.accessEvent.findMany({
    where: {
      accessPoint: {
        accessHub: { id },
      },
    },
    orderBy: { at: "desc" },
    include: {
      accessUser: true,
      accessPoint: true,
    },
  });
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accessHubId, "accessHubId not found");
  const accessHub = await getAccessHub({
    id: Number(params.accessHubId),
    userId,
  });
  const accessEvents = await getAccessEvents({id: Number(params.accessHubId)})
  return json<LoaderData>({ accessHub, accessEvents });
};

export default function RouteComponent() {
  const { accessHub, accessEvents } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={accessHub.name} />
      <Main>
        <Card title="Access Events">
          <Table
            decor="edge"
            headers={
              <>
                <Th>At</Th>
                <Th>Point</Th>
                <Th>Access</Th>
                <Th>User</Th>
                <Th>Code</Th>
              </>
            }
          >
            {accessEvents.map((i) => (
              <tr key={i.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {new Date(i.at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.accessPoint.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.access}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.accessUser ? i.accessUser.name : null}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.code}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}

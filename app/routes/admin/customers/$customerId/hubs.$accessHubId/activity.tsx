import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Card, Header, Main, Table, Th } from "~/components/lib";
import { getAccessEvents } from "~/models/accessEvent.server";
import { getAccessHub } from "~/models/accessHub.server";
import { requireUserIdForRole } from "~/session.server";

export const handle = {
  breadcrumb: "Activity",
};

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
  accessEvents: Awaited<ReturnType<typeof getAccessEvents>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessHubId },
}) => {
  await requireUserIdForRole(request, "admin");
  invariant(customerId, "customerId not found");
  invariant(accessHubId, "accessHubId not found");
  const accessHub = await getAccessHub({
    id: accessHubId,
    userId: customerId,
  });
  const accessEvents = await getAccessEvents({
    accessHubId,
  });
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

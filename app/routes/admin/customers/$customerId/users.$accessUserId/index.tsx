import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Table } from "~/components/table";
import { getAccessUserWithPoints } from "~/models/accessUser.server";
import { requireUserIdForRole } from "~/session.server";

type LoaderData = {
  accessUser: Awaited<ReturnType<typeof getAccessUserWithPoints>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessUserId },
}) => {
  await requireUserIdForRole(request, "admin");
  invariant(customerId, "customerId not found");
  invariant(accessUserId, "accessUserId not found");
  const accessUser = await getAccessUserWithPoints({
    id: Number(accessUserId),
    userId: customerId,
  });
  return json<LoaderData>({ accessUser });
};

export default function RouteComponent() {
  const { accessUser } = useLoaderData<LoaderData>();
  return (
    <>
      <PageHeader title={accessUser.name} />
      <main>
        <Section>
          <Section.Heading>Points</Section.Heading>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Heartbeat At</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {accessUser.accessPoints.map((i) => (
              <tr key={i.id}>
                <Table.Td prominent>{i.name}</Table.Td>
                <Table.Td>{i.id}</Table.Td>
                <Table.Td>
                  {i.accessHub.heartbeatAt &&
                    new Date(i.accessHub.heartbeatAt).toLocaleString()}
                </Table.Td>

                <Table.TdLink to={`../../hubs/${i.accessHubId}/points/${i.id}`}>
                  View
                </Table.TdLink>
              </tr>
            ))}
          </Table>
        </Section>
      </main>
    </>
  );
}

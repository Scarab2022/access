import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Header } from "~/components/lib";
import { Section } from "~/components/section";
import { Table } from "~/components/table";
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
      <main>
        <Section>
          <Section.Heading>Access Events</Section.Heading>
          <Table
            headers={
              <>
                <Table.Th>At</Table.Th>
                <Table.Th>Point</Table.Th>
                <Table.Th>Access</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Code</Table.Th>
              </>
            }
          >
            {accessEvents.map((i) => (
              <tr key={i.id}>
                <Table.Td prominent>{new Date(i.at).toLocaleString()}</Table.Td>
                <Table.Td>{i.accessPoint.name}</Table.Td>
                <Table.Td>{i.access}</Table.Td>
                <Table.Td>{i.accessUser ? i.accessUser.name : null}</Table.Td>
                <Table.Td>{i.code}</Table.Td>
              </tr>
            ))}
          </Table>
        </Section>
      </main>
    </>
  );
}

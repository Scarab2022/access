import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";

type LoaderData = {
  accessPoints: Awaited<ReturnType<typeof getLoaderData>>;
};

function getLoaderData({ userId }: { userId: User["id"] }) {
  return prisma.accessPoint.findMany({
    where: { accessHub: { user: { id: userId } } },
    orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessHub: true,
    },
  });
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserIdForRole(request, "customer");
  const accessPoints = await getLoaderData({ userId });
  return json<LoaderData>({ accessPoints });
};

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  return (
    <>
      <PageHeader title="Points" />
      <main>
        <Table
          headers={
            <>
              <Table.Th>Name</Table.Th>
              <Table.Th>Hub</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th sr>View</Table.Th>
            </>
          }
        >
          {accessPoints.map((i) => (
            <tr key={i.id}>
              <Table.Td prominent>{i.name}</Table.Td>
              <Table.Td>{i.accessHub.name}</Table.Td>
              <Table.Td>{i.description}</Table.Td>
              <Table.TdLink to={`${i.id}`}>View</Table.TdLink>
            </tr>
          ))}
        </Table>
      </main>
    </>
  );
}

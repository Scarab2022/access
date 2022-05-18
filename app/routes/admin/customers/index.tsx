import { Header } from "~/components/lib";
import { json, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Table } from "~/components/table";

type LoaderData = {
  customers: Awaited<ReturnType<typeof getCustomers>>;
};

function getCustomers() {
  return prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { email: "asc" },
  });
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserIdForRole(request, "admin");
  const customers = await getCustomers();
  return json<LoaderData>({ customers });
};

export default function RouteComponent() {
  const { customers } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Customers" />
      <main>
        <Table.Container chrome>
          <Table
            headers={
              <>
                <Table.Th>Email</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.ThSr>View</Table.ThSr>
              </>
            }
          >
            {customers.map((i) => (
              <tr key={i.id}>
                <Table.TdProminent>{i.email}</Table.TdProminent>
                <Table.Td>
                  {new Date(i.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.TdLink to={`${i.id}`}>View</Table.TdLink>
              </tr>
            ))}
          </Table>
        </Table.Container>
      </main>
    </>
  );
}

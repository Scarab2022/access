import {
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { json, LoaderFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";

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
  // Admin route requires admin role.
  const customers = await getCustomers();
  return json<LoaderData>({ customers });
};

export default function RouteComponent() {
  const { customers } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Customers" />
      <Main>
        <Table
          headers={
            <>
              <Th>Email</Th>
              <Th>Created At</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {customers.map((i) => (
            <tr key={i.id}>
              <TdProminent>{i.email}</TdProminent>
              <Td>{new Date(i.createdAt).toLocaleDateString()}</Td>
              <TdLink to={`${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}

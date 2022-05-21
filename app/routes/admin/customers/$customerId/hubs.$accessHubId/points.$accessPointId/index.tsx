import { LinkIcon, CheckIcon } from "@heroicons/react/solid";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Table } from "~/components/table";
import { getAccessPointWithHubAndUsers } from "~/models/accessPoint.server";
import { requireUserIdForRole } from "~/session.server";

type LoaderData = {
  accessPoint: Awaited<ReturnType<typeof getAccessPointWithHubAndUsers>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessPointId },
}) => {
  await requireUserIdForRole(request, "admin");
  invariant(customerId, "customerId not found");
  invariant(accessPointId, "accessPointId not found");
  const accessPoint = await getAccessPointWithHubAndUsers({
    id: Number(accessPointId),
    userId: customerId,
  });
  return json<LoaderData>({ accessPoint });
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={accessPoint.name}
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="ml-3 hidden sm:block">
              <Button variant="white" onClick={() => navigate("raw")}>
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </Button>
            </span>
          </>
        }
      />
      <main>
        <Section>
          <Section.Header>Users</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Activate Code At</Table.Th>
                <Table.Th>Expire Code At</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {accessPoint.accessUsers.map((i) => (
              <tr key={i.id}>
                <Table.Td prominent>{i.name}</Table.Td>
                <Table.Td>{i.id}</Table.Td>
                <Table.Td>{i.code}</Table.Td>
                <Table.Td>
                  {i.activateCodeAt &&
                    new Date(i.activateCodeAt).toLocaleString()}
                </Table.Td>
                <Table.Td>
                  {i.expireCodeAt && new Date(i.expireCodeAt).toLocaleString()}
                </Table.Td>
                <Table.TdLink to={`../../../users/${i.id}`}>View</Table.TdLink>
              </tr>
            ))}
          </Table>
        </Section>
      </main>
    </>
  );
}

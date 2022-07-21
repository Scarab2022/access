import { CheckIcon, LinkIcon } from "@heroicons/react/solid";
import { AccessHub, User } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { Table } from "~/components/table";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
};

function getAccessHub(id: AccessHub["id"], customerId: User["id"]) {
  return prisma.accessHub.findFirstOrThrow({
    where: {
      id,
      user: { id: customerId },
    },
    include: {
      accessPoints: { orderBy: { position: "asc" } },
    },
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessHubId },
}) => {
  await requireUserIdForRole(request, "admin");
  invariant(customerId, "customerId not found");
  invariant(accessHubId, "accessHubId not found");
  const accessHub = await getAccessHub(accessHubId, customerId);
  return json<LoaderData>({ accessHub });
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={accessHub.name}
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
          <Section.Header>Points</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Position</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {accessHub.accessPoints.map((i) => (
              <tr key={i.id}>
                <Table.Td>{i.position}</Table.Td>
                <Table.Td prominent>{i.name}</Table.Td>
                <Table.Td>{i.id}</Table.Td>
                <Table.TdLink to={`points/${i.id}`}>View</Table.TdLink>
              </tr>
            ))}
          </Table>
        </Section>
      </main>
    </>
  );
}

import { CheckIcon, LinkIcon } from "@heroicons/react/solid";
import { AccessHub, User } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Button,
  Card,
  Header,
  Main,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
};

function getAccessHub(id: AccessHub["id"], customerId: User["id"]) {
  return prisma.accessHub.findFirst({
    where: {
      id,
      user: { id: customerId },
    },
    include: {
      accessPoints: { orderBy: { position: "asc" } },
    },
    rejectOnNotFound: true,
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
      <Header
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
      <Main>
        <Card title="Points">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Position</Th>
                <Th>Name</Th>
                <Th>ID</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessHub.accessPoints.map((i) => (
              <tr key={i.id}>
                <Td>{i.position}</Td>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <TdLink to={`points/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}

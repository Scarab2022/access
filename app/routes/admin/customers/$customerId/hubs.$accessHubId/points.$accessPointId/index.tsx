import { LinkIcon, CheckIcon } from "@heroicons/react/solid";
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
import { getAccessPointWithHubAndUsers } from "~/models/accessPoint.server";

type LoaderData = {
  accessPoint: Awaited<ReturnType<typeof getAccessPointWithHubAndUsers>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessPointId },
}) => {
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
      <Header
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
      <Main>
        <Card title="Users">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Code</Th>
                <Th>Activate Code At</Th>
                <Th>Expire Code At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessPoint.accessUsers.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.code}</Td>
                <Td>
                  {i.activateCodeAt &&
                    new Date(i.activateCodeAt).toLocaleString()}
                </Td>
                <Td>
                  {i.expireCodeAt && new Date(i.expireCodeAt).toLocaleString()}
                </Td>
                <TdLink to={`../../../users/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}

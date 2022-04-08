import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
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
import { getAccessUserWithPoints } from "~/models/accessUser.server";

type LoaderData = {
  accessUser: Awaited<ReturnType<typeof getAccessUserWithPoints>>
};

export const loader: LoaderFunction = async ({
  params: { customerId, accessUserId },
}) => {
  invariant(customerId, "customerId not found")
  invariant(accessUserId, "accessUserId not found")
  // const accessUser = await db.accessUser.findFirst({
  //   where: {
  //     id: Number(accessUserId),
  //     user: { id: Number(customerId) },
  //   },
  //   include: {
  //     accessPoints: {
  //       orderBy: { name: "asc" },
  //       include: { accessHub: true },
  //     },
  //   },
  //   rejectOnNotFound: true,
  // });
  const accessUser = await getAccessUserWithPoints({id: Number(accessUserId), userId: customerId})
  return json<LoaderData>({ accessUser });
};

export default function RouteComponent() {
  const { accessUser } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={accessUser.name} />
      <Main>
        <Card title="Points">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Heartbeat At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessUser.accessPoints.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>
                  {i.accessHub.heartbeatAt &&
                    new Date(i.accessHub.heartbeatAt).toLocaleString()}
                </Td>

                <TdLink to={`../../hubs/${i.accessHubId}/points/${i.id}`}>
                  View
                </TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}

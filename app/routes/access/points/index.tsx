import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import {
  Header,
  Main,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";

// type LoaderData = {
//   accessPoints: Prisma.AccessPointGetPayload<{
//     include: {
//       accessUsers: true;
//       accessHub: true;
//     };
//   }>[];
// };

// export const loader: LoaderFunction = async ({
//   request,
// }): Promise<LoaderData> => {
//   const { userId } = await requireUserSession(request, "customer");
//   const accessPoints = await db.accessPoint.findMany({
//     where: { accessHub: { user: { id: userId } } },
//     orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
//     include: {
//       accessUsers: { orderBy: { name: "asc" } },
//       accessHub: true,
//     },
//   });
//   return { accessPoints };
// };

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
  const userId = await requireUserId(request);
  const accessPoints = await getLoaderData({ userId });
  return json<LoaderData>({ accessPoints });
};

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Points" />
      <Main>
        <Table
          headers={
            <>
              <Th>Name</Th>
              <Th>Hub</Th>
              <Th>Description</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {accessPoints.map((i) => (
            <tr key={i.id}>
              <TdProminent>{i.name}</TdProminent>
              <Td>{i.accessHub.name}</Td>
              <Td>{i.description}</Td>
              <TdLink to={`${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}

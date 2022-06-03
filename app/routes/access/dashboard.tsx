import * as React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useLocation } from "@remix-run/react";
import type { AccessHub, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { Switch } from "~/components/switch";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";

export const handle = {
  breadcrumb: "Dashboard",
};

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

async function getLoaderData({ userId }: { userId: User["id"] }) {
  // return prisma.accessPoint.findMany({
  //   where: {
  //     accessHub: {
  //       userId: userId,
  //     },
  //   },
  //   include: {
  //     accessUsers: true,
  //     accessHub: {
  //       include: {
  //         user: true,
  //       },
  //     },
  //   },
  //   orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
  // });

  const accessHubs = await prisma.accessHub.findMany({
    where: {
      userId,
    },
    orderBy: [{ name: "asc" }],
    include: {
      accessPoints: {
        include: {
          accessUsers: true,
          accessEvents: {
            where: {
              at: {
                gte: new Date(Date.now() - 12 * 60 * 60 * 1000),
              },
            },
          },
          _count: {
            select: { accessEvents: true },
          },
        },
      },
    },
  });

  const groupBy = await prisma.accessEvent.groupBy({
    by: ["accessPointId", "access"],
    orderBy: [{ accessPointId: "asc" }],
    _count: {
      _all: true,
      access: true,
    },
  });

  return { accessHubs, groupBy };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserIdForRole(request, "customer");
  const data = await getLoaderData({ userId });
  return json<LoaderData>(data);
};

function connectionStatus(heartbeatAt: AccessHub["heartbeatAt"]) {
  if (heartbeatAt) {
    const deltaMs = Date.now() - new Date(heartbeatAt).getTime();
    if (deltaMs < 5 * 1000) {
      return "Live";
    }
    if (deltaMs < 10 * 1000) {
      return "Dying";
    }
  }
  return "Dead";
}

export default function RouteComponent() {
  const { accessHubs, groupBy } = useLoaderData<LoaderData>();
  const poll = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => poll.load(location.pathname), 5000);
      return () => clearInterval(intervalId);
    }
  }, [location, isPolling, poll]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        side={
          <Switch.Group>
            <Switch checked={isPolling} onChange={setIsPolling} />
            <Switch.Label className="ml-3">Poll</Switch.Label>
          </Switch.Group>
        }
      />
      <main>
        <pre>{JSON.stringify(groupBy, null, 2)}</pre>
        <pre>{JSON.stringify(accessHubs, null, 2)}</pre>
        {/* <Table
          headers={
            <>
              <Table.Th>Hub</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Connection</Table.Th>
              <Table.Th sr>View</Table.Th>
            </>
          }
        >
          {(poll.data?.accessPoints ?? accessPoints).map((i) => (
            <tr key={i.id}>
              <Table.Td>{i.accessHub.name}</Table.Td>
              <Table.Td prominent>{i.name}</Table.Td>
              <Table.Td>{connectionStatus(i.accessHub.heartbeatAt)}</Table.Td>
              <Table.TdLink to={`../hubs/${i.accessHubId}/points/${i.id}`}>
                View
              </Table.TdLink>
            </tr>
          ))}
        </Table> */}
      </main>
    </>
  );
}

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
  const accessHubs = await prisma.accessHub.findMany({
    where: {
      userId,
    },
    orderBy: [{ name: "asc" }],
    include: {
      accessPoints: {
        include: {
          _count: {
            select: { accessUsers: true },
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
    },
    where: {
      at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      accessPoint: {
        accessHub: {
          user: {
            id: userId,
          },
        },
      },
    },
  });

  const pointsStats = groupBy.reduce(
    (acc: { [key: number]: { grant: number; deny: number } }, v) => {
      const {
        accessPointId,
        access,
        _count: { _all: count },
      } = v;
      if (!acc[accessPointId]) {
        acc[accessPointId] = { grant: 0, deny: 0 };
      }
      if (access === "grant" || access === "deny") {
        acc[accessPointId][access] = count;
      }
      return acc;
    },
    {}
  );

  const accessHubsWithStats = accessHubs.map((v) => {
    const accessPointsWithStats = v.accessPoints.map((p) => {
      return {
        ...p,
        _count: {
          ...p._count,
          ...(pointsStats[p.id] ?? { grant: 0, deny: 0 }),
        },
      };
    });
    return {
      ...v,
      accessPoints: accessPointsWithStats,
      _count: accessPointsWithStats.reduce(
        (acc, v) => {
          return {
            grant: acc.grant + v._count.grant,
            deny: acc.deny + v._count.deny,
          };
        },
        { grant: 0, deny: 0 }
      ),
    };
  });

  return { accessHubs, accessHubsWithStats, groupBy, pointsStats };
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
  const { accessHubsWithStats, accessHubs, groupBy, pointsStats } =
    useLoaderData<LoaderData>();
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
        <pre>{JSON.stringify(accessHubsWithStats, null, 2)}</pre>
        <pre>{JSON.stringify(pointsStats, null, 2)}</pre>
        {/* <pre>{JSON.stringify(groupBy, null, 2)}</pre> */}
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

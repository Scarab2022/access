import * as React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useLocation, Link } from "@remix-run/react";
import type { AccessHub, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { Switch } from "~/components/switch";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";
import { Badge } from "~/components/badge";

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

  const accessHubsWithStats = accessHubs.map((h) => {
    const accessPointsWithStats = h.accessPoints.map((p) => {
      return {
        ...p,
        _count: {
          ...p._count,
          ...(pointsStats[p.id] ?? { grant: 0, deny: 0 }),
        },
      };
    });
    return {
      ...h,
      accessPoints: accessPointsWithStats,
      connectionStatus: connectionStatus(h.heartbeatAt),
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

  return { accessHubsWithStats };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserIdForRole(request, "customer");
  const data = await getLoaderData({ userId });
  return json<LoaderData>(data);
};

const connectionStatusColors = {
  Dying: "yellow",
  Live: "green",
  Dead: "red",
} as const;

function connectionStatus(heartbeatAt: AccessHub["heartbeatAt"]) {
  // as const so infer is string literal not string
  if (heartbeatAt) {
    const deltaMs = Date.now() - new Date(heartbeatAt).getTime();
    if (deltaMs < 5 * 1000) {
      return "Live" as const;
    }
    if (deltaMs < 10 * 1000) {
      return "Dying" as const;
    }
  }
  return "Dead" as const;
}

export default function RouteComponent() {
  const { accessHubsWithStats } = useLoaderData<LoaderData>();
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
      <main className="space-y-8">
        {(poll.data?.accessHubsWithStats ?? accessHubsWithStats).map((h) => {
          // Simple cards: https://tailwindui.com/components/application-ui/lists/grid-lists
          return (
            <div
              key={h.id}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              <div className="col-span-1 flex rounded-md shadow-sm">
                {/* <div className="col-span-1 flex rounded-md border border-gray-300"> */}
                <div className="flex w-16 flex-shrink-0 items-center justify-center rounded-l-md bg-pink-600 text-sm font-medium text-white">
                  HUB
                </div>
                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                  <div className="flex-1 truncate px-4 py-2 text-sm">
                    <Link
                      to={`../hubs/${h.id}`}
                      className="font-medium text-gray-900 hover:text-gray-600"
                    >
                      {h.name}
                    </Link>
                    <p className="text-gray-500">
                      Last 24 hours {h._count.grant} grants and {h._count.deny}{" "}
                      denies.
                    </p>
                  </div>
                  <div className="flex-shrink-0  pr-2">
                    <Badge color={connectionStatusColors[h.connectionStatus]}>{h.connectionStatus}</Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <pre>{JSON.stringify(accessHubsWithStats, null, 2)}</pre>
        {(poll.data?.accessHubsWithStats ?? accessHubsWithStats).map((h) => {
          return (
            <Table
              key={h.id}
              headers={
                <>
                  <Table.Th>Hub</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Connection</Table.Th>
                  <Table.Th sr>View</Table.Th>
                </>
              }
            >
              {h.accessPoints.map((i) => (
                <tr key={i.id}>
                  <Table.Td>{h.name}</Table.Td>
                  <Table.Td prominent>{i.name}</Table.Td>
                  <Table.Td>{connectionStatus(h.heartbeatAt)}</Table.Td>
                  <Table.TdLink to={`../hubs/${h.id}/points/${i.id}`}>
                    View
                  </Table.TdLink>
                </tr>
              ))}
            </Table>
          );
        })}
      </main>
    </>
  );
}

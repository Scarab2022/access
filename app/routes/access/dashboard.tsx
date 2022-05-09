import * as React from "react";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useFetcher, useLocation } from "@remix-run/react";
import type { AccessHub, User } from "@prisma/client";
import { prisma } from "~/db.server";
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
import { requireUserId } from "~/session.server";
import { Switch } from "@headlessui/react";
import { classNames } from "~/utils";
import { StyledSwitch } from "~/components/styled-switch";

export const handle = {
  breadcrumb: "Dashboard",
};

type LoaderData = {
  accessPoints: Awaited<ReturnType<typeof getLoaderData>>;
};

function getLoaderData({ userId }: { userId: User["id"] }) {
  return prisma.accessPoint.findMany({
    where: {
      accessHub: {
        userId: userId,
      },
    },
    include: {
      accessUsers: true,
      accessHub: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
  });
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const accessPoints = await getLoaderData({ userId });
  return json<LoaderData>({ accessPoints });
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
  const { accessPoints } = useLoaderData<LoaderData>();
  const poll = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => poll.load(location.pathname), 5000);
      return () => clearInterval(intervalId);
    }
  }, [location, isPolling, poll]);

  return (
    <>
      <Header
        title="Dashboard"
        side={
          <StyledSwitch.Group>
            <StyledSwitch checked={isPolling} onChange={setIsPolling} />
            <StyledSwitch.Label className="ml-3">Poll</StyledSwitch.Label>
          </StyledSwitch.Group>
        }
      />
      <Main>
        <Table
          headers={
            <>
              <Th>Hub</Th>
              <Th>Name</Th>
              <Th>Connection</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {(poll.data?.accessPoints ?? accessPoints).map((i) => (
            <tr key={i.id}>
              <Td>{i.accessHub.name}</Td>
              <TdProminent>{i.name}</TdProminent>
              <Td>{connectionStatus(i.accessHub.heartbeatAt)}</Td>
              <TdLink to={`../points/${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}

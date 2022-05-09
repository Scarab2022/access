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

function MySwitch({
  className,
  checked,
  children,
  ...props
}: Parameters<typeof Switch>[0]) {
  return (
    <Switch
      {...props}
      checked={checked}
      className={classNames(
        className,
        checked ? "bg-indigo-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      )}
      children={
        children ? (
          children
        ) : (
          <span
            aria-hidden="true"
            className={classNames(
              checked ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        )
      }
    />
  );
}

MySwitch.Group = ({
  as = "div",
  className,
  ...props
}: Parameters<typeof Switch.Group>[0]) => {
  return (
    <Switch.Group
      {...props}
      as={as}
      className={className ? className : "flex items-center"}
    />
  );
};

MySwitch.Label = ({
  as = "span",
  className,
  ...props
}: Parameters<typeof Switch.Label>[0]) => {
  return (
    <Switch.Label
      {...props}
      as={as}
      className={classNames(className, "text-sm font-medium text-gray-900")}
    />
  );
};

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
          <MySwitch.Group>
            <MySwitch checked={isPolling} onChange={setIsPolling} />
            <MySwitch.Label className="ml-3">Poll</MySwitch.Label>
          </MySwitch.Group>
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

import React from "react";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { Header, Main } from "~/components/lib";
import { AccessHub, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { json, LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";

export const handle = {
  breadcrumb: "Raw",
};

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
};

function getAccessHub({
  id,
  userId,
}: Pick<AccessHub, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessHub.findFirst({
    where: { id, user: { id: userId } },
    include: {
      accessPoints: {
        include: {
          accessUsers: { orderBy: { name: "asc" } },
        },
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessHubId },
}) => {
  invariant(customerId, "customerId not found");
  invariant(accessHubId, "accessHubId not found");
  // const accessHub = await db.accessHub.findFirst({
  //   where: { id: Number(accessHubId), user: { id: Number(customerId) } },
  //   include: {
  //     accessPoints: {
  //       include: {
  //         accessUsers: { orderBy: { name: "asc" } },
  //       },
  //       orderBy: { position: "asc" },
  //     },
  //   },
  //   rejectOnNotFound: true,
  // });
  const accessHub = await getAccessHub({
    id: Number(accessHubId),
    userId: customerId,
  });
  return json<LoaderData>({ accessHub });
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
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
        title={accessHub.name}
        side={
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="poll"
                aria-describedby="comments-description"
                name="poll"
                type="checkbox"
                checked={isPolling}
                onChange={() => setIsPolling(!isPolling)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="poll" className="font-medium text-gray-700">
                Poll
              </label>
            </div>
          </div>
        }
      />
      <Main>
        <pre>{JSON.stringify(poll.data?.accessHub ?? accessHub, null, 2)}</pre>
      </Main>
    </>
  );
}

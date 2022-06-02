import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Button } from "~/components/button";
import { getAccessUsers } from "~/models/accessUser.server";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { StackedList } from "~/components/stacked-list";
import { PageHeader } from "~/components/page-header";
import { Badge } from "~/components/badge";

type LoaderData = {
  accessUsers: Awaited<ReturnType<typeof getAccessUsers>>;
};

function codeActivateExpireStatus(
  accessUser: LoaderData["accessUsers"][number]
) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activateCodeAt = accessUser.activateCodeAt
    ? new Date(accessUser.activateCodeAt)
    : null;
  const expireCodeAt = accessUser.expireCodeAt
    ? new Date(accessUser.expireCodeAt)
    : null;
  const now = Date.now();

  const codeStatus: "PENDING" | "ACTIVE" | "EXPIRED" =
    expireCodeAt && now > expireCodeAt.getTime()
      ? "EXPIRED"
      : activateCodeAt && now < activateCodeAt.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expireCodeAt
        ? `Will expire at ${expireCodeAt.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expireCodeAt
        ? `Will activate at ${activateCodeAt?.toLocaleString()} until ${expireCodeAt.toLocaleString()}.`
        : `Will activate at ${activateCodeAt?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

const codeStatusColors = {
  PENDING: "yellow",
  ACTIVE: "green",
  EXPIRED: "red",
} as const;

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserIdForRole(request, "customer");
  const accessUsers = await getAccessUsers({ userId });
  return { accessUsers };
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  // With right-justified second column
  // https://tailwindui.com/components/application-ui/lists/stacked-lists
  return (
    <>
      <PageHeader
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <main>
        <StackedList.Chrome className="mx-auto max-w-2xl">
          <StackedList>
            {accessUsers.map((i) => {
              const { codeStatus, activateExpireStatus } =
                codeActivateExpireStatus(i);
              return (
                <li key={i.id}>
                  <StackedList.Link to={`${i.id}`}>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600">
                        {i.name}
                      </p>
                      <Badge color={codeStatusColors[codeStatus]}>
                        {codeStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <p className="mt-2 flex items-center ">
                        <LocationMarkerIcon
                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        {i.code}
                      </p>
                      <p className="mt-2 hidden md:block">
                        {activateExpireStatus}
                      </p>
                    </div>
                  </StackedList.Link>
                </li>
              );
            })}
          </StackedList>
        </StackedList.Chrome>
      </main>
    </>
  );
}

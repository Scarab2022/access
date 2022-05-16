import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Button, Header } from "~/components/lib";
import { getAccessUsers } from "~/models/accessUser.server";
import { classNames } from "~/utils";
import { LocationMarkerIcon } from "@heroicons/react/solid";

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
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
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
      <Header
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <main>
        <ul className="divide-y divide-gray-200 rounded-lg ring-1 ring-gray-300 ">
          {accessUsers.map((i) => {
            const { codeStatus, activateExpireStatus } =
              codeActivateExpireStatus(i);
            return (
              <li key={i.id}>
                <Link
                  to={`${i.id}`}
                  className="block px-4 py-4 hover:bg-gray-50 sm:px-6"
                >
                  <div className="">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600">
                        {i.name}
                      </p>
                      <p
                        className={classNames(
                          "rounded-full px-2 text-xs font-semibold leading-5",
                          codeStatusColors[codeStatus]
                        )}
                      >
                        {codeStatus}
                      </p>
                    </div>
                    <p className="mt-2 flex items-center text-sm text-gray-500">
                      <LocationMarkerIcon
                        className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      {i.code}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

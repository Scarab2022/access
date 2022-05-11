import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import {
  Button,
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { getAccessUsers } from "~/models/accessUser.server";
import { classNames } from "~/utils";

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
  return (
    <>
      <Header
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <Main>
        {/* https://tailwindui.com/components/application-ui/lists/grid-lists */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accessUsers.map((i) => {
            const { codeStatus, activateExpireStatus } =
              codeActivateExpireStatus(i);
            return (
              <li
                key={i.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
              >
                <div className="flex w-full items-center justify-between space-x-6 p-6">
                  <h3 className="flex-1 truncate text-sm font-medium text-gray-900">
                    {i.name}
                  </h3>
                  <div
                    className={classNames(
                      codeStatusColors[codeStatus],
                      "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    )}
                  >
                    {codeStatus}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Table
          headers={
            <>
              <Th>Name</Th>
              <Th>Id</Th>
              <Th>Code</Th>
              <Th>Code Status</Th>
              <Th>Activate Expire Status</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {accessUsers.map((i) => {
            const { codeStatus, activateExpireStatus } =
              codeActivateExpireStatus(i);
            return (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.code}</Td>
                <Td>{codeStatus}</Td>
                <Td>{activateExpireStatus}</Td>
                <TdLink to={i.id.toString()}>View</TdLink>
              </tr>
            );
          })}
        </Table>
      </Main>
    </>
  );
}

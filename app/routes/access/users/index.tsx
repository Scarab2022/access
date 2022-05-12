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
  return (
    <>
      <Header title="Users" />
      <TableWithWhiteBackground />
      {/* <Example /> */}
    </>
  );
}

export function RouteComponent_() {
  const { accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <div className="px-4 sm:px-6 lg:px-8">
        <Example />
      </div>
      <Main>
        <Example />
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
          decor="edge"
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

/* This example requires Tailwind CSS v2.0+ */
const plans = [
  {
    id: 1,
    name: "Hobby",
    memory: "4 GB RAM",
    cpu: "4 CPUs",
    storage: "128 GB SSD disk",
    price: "$40",
    isCurrent: false,
  },
  {
    id: 2,
    name: "Startup",
    memory: "8 GB RAM",
    cpu: "6 CPUs",
    storage: "256 GB SSD disk",
    price: "$80",
    isCurrent: true,
  },
  // More plans...
];

// With white background and borders: https://tailwindui.com/components/application-ui/lists/tables
function Example() {
  return (
    // <div className="px-4 sm:px-6 lg:px-8">
    <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Plan
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
            >
              Memory
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
            >
              CPU
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
            >
              Storage
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Price
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Select</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, planIdx) => (
            <tr key={plan.id}>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-transparent",
                  "relative py-4 pl-4 pr-3 text-sm sm:pl-6"
                )}
              >
                <div className="font-medium text-gray-900">
                  {plan.name}
                  {plan.isCurrent ? (
                    <span className="text-indigo-600">(Current Plan)</span>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden">
                  <span>
                    {plan.memory} / {plan.cpu}
                  </span>
                  <span className="hidden sm:inline"> · </span>
                  <span>{plan.storage}</span>
                </div>
                {planIdx !== 0 ? (
                  <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" />
                ) : null}
              </td>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-gray-200",
                  "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                )}
              >
                {plan.memory}
              </td>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-gray-200",
                  "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                )}
              >
                {plan.cpu}
              </td>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-gray-200",
                  "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                )}
              >
                {plan.storage}
              </td>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-gray-200",
                  "px-3 py-3.5 text-sm text-gray-500"
                )}
              >
                <div className="sm:hidden">{plan.price}/mo</div>
                <div className="hidden sm:block">{plan.price}/month</div>
              </td>
              <td
                className={classNames(
                  planIdx === 0 ? "" : "border-t border-transparent",
                  "relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                )}
              >
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={plan.isCurrent}
                >
                  Select<span className="sr-only">, {plan.name}</span>
                </button>
                {planIdx !== 0 ? (
                  <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // </div>
  );
}

/* This example requires Tailwind CSS v2.0+ */
const people = [
  {
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "lindsay.walton@example.com",
    role: "Member",
  },
  {
    name: "Walton Lind",
    title: "Back-end Developer",
    email: "walton@example.com",
    role: "Admin",
  },
];

// With white background: https://tailwindui.com/components/application-ui/lists/tables
// With white background and borders: https://tailwindui.com/components/application-ui/lists/tables
function TableWithWhiteBackground() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* <div className="mt-8 flex flex-col"> */}
      <div className="ring-1 ring-gray-300 md:mx-0 md:rounded-lg -my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8-">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {people.map((person) => (
                <tr key={person.email}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                    {person.name}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                    {person.title}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                    {person.email}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                    {person.role}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 md:pr-0">
                    <a
                      href="."
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit<span className="sr-only">, {person.name}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

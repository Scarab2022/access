import { Link } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/components";

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
    >
      {children}
    </th>
  );
}

function ThSr({ children }: { children: React.ReactNode }) {
  return (
    // Tailwind comment: relative needed to work around issue on safari mobile.
    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
      <span className="sr-only">{children}</span>
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
      {children}
    </td>
  );
}

function TdProminent({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
      {children}
    </td>
  );
}

// Intended for link in last column since text-right.
export function TdLink({
  children,
  to,
  onClick,
}: { children: React.ReactNode } & Pick<RemixLinkProps, "to" | "onClick">) {
  // Tailwind comment: relative needed to work around issue on safari mobile if sr-only in children?
  return (
    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 md:pr-0">
      <Link
        to={to}
        className="text-indigo-600 hover:text-indigo-900"
        onClick={onClick}
      >
        {children}
      </Link>
    </td>
  );
}

// With white background: https://tailwindui.com/components/application-ui/lists/tables
// With white background and borders: https://tailwindui.com/components/application-ui/lists/tables
function Table({
  headers,
  children,
}: {
  headers: React.ReactFragment;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:-mx-8- -my-2 -mx-4 overflow-x-auto ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

Table.Th = Th;
Table.ThSr = ThSr;
Table.Td = Td;
Table.TdProminent = TdProminent;
Table.TdLink = TdLink;

export { Table };

{
  /* <th
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
                </th> */
}

// <tr key={person.email}>
//   <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
//     {person.name}
//   </td>
//   <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
//     {person.title}
//   </td>
//   <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
//     {person.email}
//   </td>
//   <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
//     {person.role}
//   </td>
//   <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 md:pr-0">
//     <a
//       href="."
//       className="text-indigo-600 hover:text-indigo-900"
//     >
//       Edit<span className="sr-only">, {person.name}</span>
//     </a>
//   </td>
// </tr>

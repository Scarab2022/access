import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { StackedList } from "~/components/stacked-list";
import { PageHeader } from "~/components/page-header";
import { Badge } from "~/components/badge";

type LoaderData = {
  accessHubs: Awaited<ReturnType<typeof getLoaderData>>;
};

function getLoaderData({ userId }: { userId: User["id"] }) {
  return prisma.accessHub.findMany({
    where: {
      user: { id: userId },
    },
    orderBy: { name: "asc" },
  });
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserIdForRole(request, "customer");
  const accessHubs = await getLoaderData({ userId });
  return json<LoaderData>({ accessHubs });
};

export default function RouteComponent() {
  const { accessHubs } = useLoaderData<LoaderData>();

  // With right-justified second column
  // https://tailwindui.com/components/application-ui/lists/stacked-lists
  return (
    <>
      <PageHeader title="Hubs" />
      <main>
        <StackedList.Chrome className="mx-auto max-w-2xl">
          <StackedList>
            {accessHubs.map((i) => (
              <li key={i.id}>
                <StackedList.Link to={`${i.id}`}>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {i.name}
                    </p>
                    <Badge color="green">ACTIVE</Badge>
                  </div>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <LocationMarkerIcon
                      className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    {i.description}
                  </p>
                </StackedList.Link>
              </li>
            ))}
          </StackedList>
        </StackedList.Chrome>
      </main>
    </>
  );
}

import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { Header } from "~/components/lib";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { StackedList } from "~/components/stacked-list";

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
      <Header title="Hubs" />
      <main>
        <StackedList.Chrome>
          <StackedList>
            {accessHubs.map((i) => (
              <li key={i.id}>
                <StackedList.Link to={`${i.id}`}>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {i.name}
                    </p>
                    <p className="rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      Active
                    </p>
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

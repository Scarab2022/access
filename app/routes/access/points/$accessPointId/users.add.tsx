import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { SettingsForm } from "~/components/lib";
import {
  getAccessPoint,
  getAccessPointWithHubAndUsers,
} from "~/models/accessPoint.server";
import invariant from "tiny-invariant";
import { User } from "@prisma/client";
import { PageHeader } from "~/components/page-header";

export const handle = {
  breadcrumb: "Add Users",
};

type LoaderData = {
  accessUsers: Awaited<ReturnType<typeof getAccessUsers>>;
};

function getAccessUsers({
  notIn,
  userId,
}: {
  notIn: number[];
  userId: User["id"];
}) {
  return prisma.accessUser.findMany({
    where: {
      id: { notIn },
      deletedAt: new Date(0),
      user: { id: userId },
    },
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessPointId, "accessPointId not found");

  const accessPoint = await getAccessPointWithHubAndUsers({
    id: Number(accessPointId),
    userId,
  });
  const notIn = accessPoint.accessUsers.map((el) => el.id);
  const accessUsers = await getAccessUsers({ notIn, userId });
  return { accessUsers };
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessPointId, "accessPointId not found");

  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let ids = [];
  for (let idx = 0; fieldValues[`accessUser-${idx}-id`]; ++idx) {
    if (fieldValues[`accessUser-${idx}`]) {
      ids.push(Number(fieldValues[`accessUser-${idx}-id`]));
    }
  }
  if (ids.length > 0) {
    const accessPoint = await getAccessPoint({
      id: Number(accessPointId),
      userId,
    });

    // TODO: validate the access user id's: that they belong to the user
    await prisma.accessPoint.update({
      where: { id: accessPoint.id },
      data: { accessUsers: { connect: ids.map((id) => ({ id })) } },
    });
  }
  return redirect(`/access/points/${accessPointId}`);
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  return (
    <>
      <PageHeader />
      <main>
        <SettingsForm
          replace
          method="post"
          title={`Add Users`}
          submitText="Add"
        >
          <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {accessUsers.map((au, auIdx) => (
              <div key={au.id} className="relative flex items-start py-4">
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={`accessUser-${auIdx}`}
                    className="select-none font-medium text-gray-700"
                  >
                    {au.name}
                  </label>
                </div>
                <div className="ml-3 flex h-5 items-center">
                  <input
                    id={`accessUser-${auIdx}`}
                    name={`accessUser-${auIdx}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    id={`accessUser-${auIdx}-id`}
                    name={`accessUser-${auIdx}-id`}
                    type="hidden"
                    value={au.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </SettingsForm>
      </main>
    </>
  );
}

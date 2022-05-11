import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Header, Main, SettingsForm } from "~/components/lib";
import { addPointsToAccessUser, getAccessUserWithPoints } from "~/models/accessUser.server";
import invariant from "tiny-invariant";
import { getAccessPointsNotIn } from "~/models/accessPoint.server";

export const handle = {
  breadcrumb: "Add Points",
};

type LoaderData = {
  accessPoints: Awaited<ReturnType<typeof getAccessPointsNotIn>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessUserId, "accessUserId not found")
  const accessUser = await getAccessUserWithPoints({
    id: Number(accessUserId),
    userId,
  });
  const notIn = accessUser.accessPoints.map((el) => el.id);
  const accessPoints = await getAccessPointsNotIn({notIn, userId})
  return json<LoaderData>({ accessPoints });
};

export const action: ActionFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessUserId, "accessUserId not found");

  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let accessPointIds = [];
  for (let idx = 0; fieldValues[`accessPoint-${idx}-id`]; ++idx) {
    if (fieldValues[`accessPoint-${idx}`]) {
      accessPointIds.push(Number(fieldValues[`accessPoint-${idx}-id`]));
    }
  }
  if (accessPointIds.length > 0) {
    // TODO: validate ids of access points belong to user.
    await addPointsToAccessUser({id: Number(accessUserId), userId, accessPointIds})
  }
  return redirect(`/access/users/${accessUserId}`);
};

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  return (
    <>
      <Header />
      <Main>
        <SettingsForm replace method="post" title="Add Points" submitText="Add">
          <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {accessPoints.map((ap, apIdx) => (
              <div key={ap.id} className="relative flex items-start py-4">
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={`accessPoint-${apIdx}`}
                    className="select-none font-medium text-gray-700"
                  >
                    {`${ap.accessHub.name}: ${ap.name}`}
                  </label>
                </div>
                <div className="ml-3 flex h-5 items-center">
                  <input
                    id={`accessPoint-${apIdx}`}
                    name={`accessPoint-${apIdx}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    id={`accessPoint-${apIdx}-id`}
                    name={`accessPoint-${apIdx}-id`}
                    type="hidden"
                    value={ap.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </SettingsForm>
      </Main>
    </>
  );
}

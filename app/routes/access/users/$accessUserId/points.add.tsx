import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import {
  addPointsToAccessUser,
  getAccessUserWithPoints,
} from "~/models/accessUser.server";
import invariant from "tiny-invariant";
import { getAccessPointsNotIn } from "~/models/accessPoint.server";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import { Checkbox } from "~/components/checkbox";

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
  invariant(accessUserId, "accessUserId not found");
  const accessUser = await getAccessUserWithPoints({
    id: Number(accessUserId),
    userId,
  });
  const notIn = accessUser.accessPoints.map((el) => el.id);
  const accessPoints = await getAccessPointsNotIn({ notIn, userId });
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
    await addPointsToAccessUser({
      id: Number(accessUserId),
      userId,
      accessPointIds,
    });
  }
  return redirect(`/access/users/${accessUserId}`);
};

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  // Simple list with heading
  // https://tailwindui.com/components/application-ui/forms/checkboxes
  // <div class="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
  return (
    <>
      <PageHeader />
      <main>
        <Form replace method="post" className="mx-auto max-w-sm">
          <Form.Header title="Add Points" />
          <Form.Content>
            <Form.List>
              {accessPoints.map((i, idx) => {
                const idName = `accessPoint-${idx}`;
                const hiddenIdName = `${idName}-id`;
                return (
                  <Checkbox.ListItem
                    key={i.id}
                    labelProps={{
                      htmlFor: idName,
                      children: `${i.accessHub.name}: ${i.name}`,
                    }}
                    checkboxProps={{ id: idName, name: idName }}
                  >
                    <input
                      id={hiddenIdName}
                      name={hiddenIdName}
                      type="hidden"
                      value={i.id}
                    />
                  </Checkbox.ListItem>
                );
              })}
            </Form.List>
          </Form.Content>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Add</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}

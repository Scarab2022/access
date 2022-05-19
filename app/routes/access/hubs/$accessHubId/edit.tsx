import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { getAccessHub } from "~/models/accessHub.server";
import type { ZodError } from "zod";
import { z } from "zod";
import {
  PageHeader,
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";
import invariant from "tiny-invariant";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getAccessHub>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessHubId, "accessHubId not found");
  const accessHub = await getAccessHub({
    id: accessHubId,
    userId,
  });
  return json<LoaderData>({ accessHub });
};

const FieldValues = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(100),
});

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessHubId },
}): Promise<Response | ActionData> => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessHubId, "accessHubId not found");

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  // TODO: Ensure user owns access hub before updating.  Put in transaction?
  // AccessHubWhereUniqueInput in update does not include userId.
  getAccessHub({ id: accessHubId, userId });
  const { name, description } = parseResult.data;
  await prisma.accessHub.update({
    where: { id: accessHubId },
    data: { name, description },
  });

  return redirect(`/access/hubs/${accessHubId}`);
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader />
      <Main>
        <SettingsForm
          replace
          method="post"
          title="Access Hub Settings"
          formErrors={actionData?.formErrors?.formErrors}
        >
          <SettingsFormField
            id="name"
            label="Name"
            errors={actionData?.formErrors?.fieldErrors?.name}
          >
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={
                actionData?.fieldValues
                  ? actionData.fieldValues.name
                  : accessHub.name
              }
            />
          </SettingsFormField>
          <SettingsFormField
            id="description"
            label="Description"
            errors={actionData?.formErrors?.fieldErrors?.description}
          >
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={
                actionData?.fieldValues
                  ? actionData.fieldValues.description
                  : accessHub.description
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </Main>
    </>
  );
}

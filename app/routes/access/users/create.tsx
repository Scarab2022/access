import { ActionFunction, json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { z, ZodError } from "zod";
import {
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";
import { PageHeader } from "~/components/page-header";
import { createAccessUser } from "~/models/accessUser.server";
import { requireUserIdForRole } from "~/session.server";

export const handle = {
  breadcrumb: "Create",
};

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
    code: z.string().min(1).max(50),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserIdForRole(request, "customer");

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>({
      formErrors: parseResult.error.formErrors,
      fieldValues,
    });
  }

  const { name, description, code } = parseResult.data;
  const accessUser = await createAccessUser({
    name,
    description,
    code,
    userId,
  });

  return redirect(`/access/users/${accessUser.id}`);
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader />
      <Main>
        <SettingsForm
          replace
          method="post"
          title="Create Access User"
          submitText="Create"
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
                actionData?.fieldValues ? actionData.fieldValues.name : ""
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
                  : ""
              }
            />
          </SettingsFormField>
          <SettingsFormField
            id="code"
            label="Code"
            errors={actionData?.formErrors?.fieldErrors?.code}
          >
            <input
              type="text"
              name="code"
              id="code"
              defaultValue={
                actionData?.fieldValues ? actionData.fieldValues.code : ""
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </Main>
    </>
  );
}

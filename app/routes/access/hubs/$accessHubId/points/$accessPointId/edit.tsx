import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import { getAccessPoint } from "~/models/accessPoint.server";
import type { ZodError } from "zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = {
  accessPoint: Awaited<ReturnType<typeof getAccessPoint>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(params.accessHubId, "accessHubId not found");
  invariant(params.accessPointId, "accessPointId not found");
  const accessPoint = await getAccessPoint({
    id: Number(params.accessPointId),
    accessHubId: params.accessHubId,
    userId,
  });
  return json<LoaderData>({ accessPoint });
};

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(params.accessHubId, "accessHubId not found");
  invariant(params.accessPointId, "accessPointId not found");

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      { formErrors: parseResult.error.formErrors },
      { status: 400 }
    );
  }

  // TODO: Ensure user owns access point before updating.  Put in transaction?
  getAccessPoint({
    id: Number(params.accessPointId),
    accessHubId: params.accessHubId,
    userId,
  });
  await prisma.accessPoint.update({
    where: { id: Number(params.accessPointId) },
    data: {
      name: parseResult.data.name,
      description: parseResult.data.description,
    },
  });

  return redirect(
    `/access/hubs/${params.accessHubId}/points/${params.accessPointId}`
  );
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader />
      <main>
        <Form method="post" className="mx-auto max-w-sm" replace>
          <Form.Header
            title="Access Point Settings"
            errors={actionData?.formErrors?.formErrors}
          />
          <Form.Content>
            <Form.Field
              id="name"
              label="Name"
              errors={actionData?.formErrors?.fieldErrors?.name}
            >
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={accessPoint.name}
              />
            </Form.Field>
            <Form.Field
              id="description"
              label="Description"
              errors={actionData?.formErrors?.fieldErrors?.description}
            >
              <textarea
                name="description"
                id="description"
                rows={3}
                defaultValue={accessPoint.description}
              />
            </Form.Field>
          </Form.Content>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Save</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}

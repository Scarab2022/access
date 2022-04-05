import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import type { AccessHub, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import type { ZodError } from "zod";
import { z } from "zod";
import {
  Header,
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";
import invariant from "tiny-invariant";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = {
  accessHub: Awaited<ReturnType<typeof getLoaderData>>;
};

function getLoaderData({
  id,
  userId,
}: Pick<AccessHub, "id"> & {
  userId: User["id"];
}) {
  return prisma.accessHub.findFirst({
    where: { id, user: { id: userId } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accessHubId, "accessHubId not found");
  const accessHub = await getLoaderData({
    id: Number(params.accessHubId),
    userId,
  });
  return json<LoaderData>({ accessHub });
};

const FieldValues = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(100),
});
// type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);
  invariant(params.accessHubId, "accessHubId not found");

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  await prisma.accessHub.findFirst({
    where: { id: Number(params.accessHubId), user: { id: userId } },
    rejectOnNotFound: true,
  });
  const { name, description } = parseResult.data;
  await prisma.accessHub.update({
    where: { id: Number(params.accessHubId) },
    data: { name, description },
  });

  return redirect(`/access/hubs/${params.accessHubId}`);
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <Header />
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

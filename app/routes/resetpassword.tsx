import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData, useLocation } from "@remix-run/react";
import { Main, SettingsForm, SettingsFormField } from "~/components/lib";
import { z, ZodError } from "zod";
import { resetPassword } from "~/models/user.server";

const SearchParams = z
  .object({
    email: z.string().min(1).email(),
    token: z.string().min(32),
  })
  .strict();

// type LoaderData = Awaited<ReturnType<typeof validateSearchParams>>;

// export const loader: LoaderFunction = async ({
//   request,
// }): Promise<LoaderData> => {
//   return await validateSearchParams(request);
// };

const FieldValues = z
  .object({
    password: z.string().min(6).max(100),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const url = new URL(request.url);
  const searchParamsParseResult = SearchParams.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!searchParamsParseResult.success) {
    console.error({ resetPassword: searchParamsParseResult.error });
    throw new Response("Invalid reset password link.", { status: 400 });
  }

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  await resetPassword({ ...searchParamsParseResult.data, ...parseResult.data });
  return redirect(`/login`);
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  const location = useLocation();

  return (
    <Main>
      <div className="mt-8">
        <SettingsForm
          replace
          action={`${location.pathname}${location.search}`}
          method="post"
          title="Reset Password"
          formErrors={actionData?.formErrors?.formErrors}
        >
          <SettingsFormField
            id="password"
            label="Password"
            errors={actionData?.formErrors?.fieldErrors?.password}
          >
            <input
              type="password"
              name="password"
              id="password"
              defaultValue={
                actionData?.fieldValues ? actionData.fieldValues.password : ""
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </div>
    </Main>
  );
}

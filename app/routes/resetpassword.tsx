import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useLocation } from "@remix-run/react";
import type { ZodError } from "zod";
import { z } from "zod";
import { resetPassword } from "~/models/user.server";
import { Form } from "~/components/form";

const SearchParams = z
  .object({
    email: z.string().min(1).email(),
    token: z.string().min(32),
  })
  .strict();

const FieldValues = z
  .object({
    password: z.string().min(8).max(50),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
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
    return { formErrors: parseResult.error.formErrors };
  }

  await resetPassword({ ...searchParamsParseResult.data, ...parseResult.data });
  return redirect(`/login`);
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  const location = useLocation();

  return (
    <main>
      <Form
        replace
        method="post"
        action={`${location.pathname}${location.search}`}
        className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-10"
      >
        <Form.Header
          title="Reset Password"
          errors={actionData?.formErrors?.formErrors}
        />
        <Form.Content>
          <Form.Field
            id="password"
            label="Password"
            errors={actionData?.formErrors?.fieldErrors?.password}
          >
            <input type="password" name="password" id="password" />
          </Form.Field>
        </Form.Content>
        <Form.Footer>
          <Form.CancelButton />
          <Form.SubmitButton>Save</Form.SubmitButton>
        </Form.Footer>
      </Form>
    </main>
  );
}

import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { z, ZodError } from "zod";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { Form } from "~/components/form";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const FieldValues = z
  .object({
    email: z
      .string()
      .min(1)
      .max(50)
      .email()
      .transform((v) => v.toLowerCase()),
    password: z.string().min(8).max(50),
    redirectTo: z.string(),
    remember: z
      .string()
      .optional()
      .transform((v) => v === "on"),
  })
  .strict();

type ActionData = {
  formErrors?: ZodError["formErrors"];
};

export const action: ActionFunction = async ({ request }) => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      {
        formErrors: parseResult.error.formErrors,
      },
      { status: 400 }
    );
  }
  const { email, password, redirectTo, remember } = parseResult.data;
  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      {
        formErrors: {
          formErrors: [],
          fieldErrors: {
            email: ["Invalid email or password"],
          },
        },
      },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo:
      redirectTo !== ""
        ? redirectTo
        : user.role === "admin"
        ? "/admin/dashboard"
        : "/access/dashboard",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get("redirectTo") || "/access/dashboard";
  const redirectTo = searchParams.get("redirectTo") || "";
  const actionData = useActionData<ActionData>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.formErrors?.fieldErrors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.formErrors?.fieldErrors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  // Simple card
  // https://tailwindui.com/components/application-ui/forms/sign-in-forms
  // <html class="h-full bg-gray-50">
  // <body class="h-full">
  return (
    <div className="flex min-h-full flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Form method="post" className="py-8 px-4 sm:px-10" noValidate replace>
          <Form.Header className="align-center flex flex-col">
            <Form.H3 prominent>Log into your account</Form.H3>
            <Form.P prominent>
              Or{" "}
              <Link
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                join here
              </Link>
            </Form.P>
          </Form.Header>
          <Form.Content>
            <Form.Field
              id="email"
              label="Email"
              errors={actionData?.formErrors?.fieldErrors?.email}
            >
              <input
                ref={emailRef}
                type="email"
                name="email"
                id="email"
                // required
                autoFocus={true}
                autoComplete="email"
              />
            </Form.Field>
            <Form.Field
              id="password"
              label="Password"
              errors={actionData?.formErrors?.fieldErrors?.password}
            >
              <input
                ref={passwordRef}
                type="password"
                name="password"
                id="password"
                required
                autoFocus={true}
                autoComplete="current-password"
              />
            </Form.Field>
            <Form.Group className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  {" "}
                  Remember me{" "}
                </label>
              </div>

              {/* <div className="text-sm">
      <a
        href="#"
        className="font-medium text-indigo-600 hover:text-indigo-500"
      >
        {" "}
        Forgot your password?{" "}
      </a>
    </div> */}
            </Form.Group>
            <input type="hidden" name="redirectTo" value={redirectTo} />
          </Form.Content>
          <Form.Footer>
            <Form.SubmitButton wide>Log in</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </div>
    </div>
  );
}

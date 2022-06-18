import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form as RemixForm,
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import { z, ZodError } from "zod";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils";
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
    remember: z.string().transform((v) => v === "on"),
  })
  .strict();

// interface ActionData {
//   errors?: {
//     email?: string;
//     password?: string;
//   };
// }

type ActionData = {
  formErrors?: ZodError["formErrors"];
  // fieldValues?: any;
};

export const action: ActionFunction = async ({ request }) => {
  // const formData = await request.formData();
  // const email = formData.get("email");
  // const password = formData.get("password");
  // const redirectTo = formData.get("redirectTo");
  // const remember = formData.get("remember");

  // if (!validateEmail(email)) {
  //   return json<ActionData>(
  //     { errors: { email: "Email is invalid" } },
  //     { status: 400 }
  //   );
  // }

  // if (typeof password !== "string") {
  //   return json<ActionData>(
  //     { errors: { password: "Password is required" } },
  //     { status: 400 }
  //   );
  // }

  // if (password.length < 8) {
  //   return json<ActionData>(
  //     { errors: { password: "Password is too short" } },
  //     { status: 400 }
  //   );
  // }

  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return json<ActionData>(
      {
        formErrors: parseResult.error.formErrors,
        // fieldValues,
      },
      { status: 400 }
    );
  }
  const { email, password, redirectTo, remember } = parseResult.data;
  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      // { errors: { email: "Invalid email or password" } },
      { formErrors: ["Invalid email or password"] },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    // remember: remember === "on" ? true : false,
    remember,
    redirectTo:
      redirectTo !== ""
        ? redirectTo
        : user.role === "admin"
        ? "/admin/dashboard"
        : "/access/dashboard",
    // typeof redirectTo === "string" && redirectTo !== ""
    //   ? redirectTo
    //   : user.role === "admin"
    //   ? "/admin/dashboard"
    //   : "/access/dashboard",
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Log in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
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
        </p>
      </div>

      {/* <Form method="post" noValidate replace>
        <Form.Content>
        <Form.Field
              id="email"
              label="Email"
              errors={actionData?.errors?.email ? [actionData.errors.email] : undefined}
            >
              <input
                type="email"
                name="email"
                id="email"
                required
                autoFocus={true}
                autoComplete="email"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.name
                    : accessHub.name
                }
              />
            </Form.Field>
        </Form.Content>
      </Form> */}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 sm:px-10">
          {/* <RemixForm method="post" className="space-y-6" noValidate> */}
          <RemixForm method="post" className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  autoFocus={true}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={
                    actionData?.formErrors?.fieldErrors?.email
                      ? true
                      : undefined
                  }
                  aria-describedby="email-error"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.formErrors?.fieldErrors?.email && (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.formErrors.fieldErrors.email.join(". ")}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  ref={passwordRef}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={
                    actionData?.formErrors?.fieldErrors?.password
                      ? true
                      : undefined
                  }
                  aria-describedby="password-error"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {actionData?.formErrors?.fieldErrors?.password && (
                  <div className="pt-1 text-red-700" id="password-error">
                    {actionData.formErrors?.fieldErrors.password.join(". ")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              {/* <div className="text-sm">
                <a
                  href="."
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div> */}
            </div>

            <div>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </RemixForm>
        </div>
      </div>
    </div>
  );
}

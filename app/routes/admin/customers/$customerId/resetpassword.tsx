import { User } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { PageHeader } from "~/components/page-header";
import { Section } from "~/components/section";
import { prisma } from "~/db.server";
import { setUpResetPassword } from "~/models/user.server";

export const handle = {
  breadcrumb: "Reset Password",
};

type LoaderData = {
  customer: Awaited<ReturnType<typeof getCustomer>>;
};

function getCustomer(id: User["id"]) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { customerId },
}) => {
  invariant(customerId, "customerId not found");
  const customer = await getCustomer(customerId);
  return json<LoaderData>({ customer });
};

type ActionData = {
  resetPasswordHref: string;
  resetPasswordExpireAt: Date; // JSON will serialize as string.
};

export const action: ActionFunction = async ({
  request,
  params: { customerId },
}): Promise<ActionData> => {
  invariant(customerId, "customerId not found");
  const { user, token } = await setUpResetPassword({
    id: customerId,
    resetPasswordExpireAt: new Date(Date.now() + 1000 * 60 * 60 * 6),
  });
  const url = new URL(request.url);
  url.pathname = "/resetpassword";
  const urlSearchParams = new URLSearchParams({
    email: user.email,
    token,
  });
  url.search = urlSearchParams.toString();
  invariant(
    user.password?.resetPasswordExpireAt,
    "resetPasswordExpireAt not found"
  );
  return {
    resetPasswordHref: url.toString(),
    resetPasswordExpireAt: user.password.resetPasswordExpireAt,
  };
};

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <PageHeader title={customer.email} />
      <main>
        <Section>
          <Section.Header>Password Reset Link</Section.Header>
          <Section.Content>
            {actionData ? (
              <div>
                <p>{actionData.resetPasswordHref}</p>
                <p className="mt-2">
                  Expires at{" "}
                  {new Date(actionData.resetPasswordExpireAt).toLocaleString()}
                </p>
              </div>
            ) : (
              "Already generated."
            )}
          </Section.Content>
        </Section>
      </main>
    </>
  );
}

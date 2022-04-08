import { User } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Card, Header, Main } from "~/components/lib";
import { prisma } from "~/db.server";
// import {
//   generatePasswordResetTokenAndHash,
//   requireUserSession,
// } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Reset Password",
};

type LoaderData = {
  customer: Awaited<ReturnType<typeof getCustomer>>;
};

function getCustomer(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    rejectOnNotFound: true,
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
  // const { token, hash } = await generatePasswordResetTokenAndHash();
  const token = "token";
  const resetPasswordExpireAt = new Date(Date.now() + 1000 * 60 * 60 * 6);
  // const customer = await db.user.update({
  //   data: {
  //     resetPasswordHash: hash,
  //     resetPasswordExpireAt,
  //   },
  //   where: { id: Number(customerId) },
  // });

  const url = new URL(request.url);
  url.pathname = "/resetpassword";
  const urlSearchParams = new URLSearchParams({
    // email: customer.email,
    token,
  });
  url.search = urlSearchParams.toString();
  return { resetPasswordHref: url.toString(), resetPasswordExpireAt };
};

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <Header title={customer.email} />
      <Main>
        <Card title="Password Reset Link">
          <div className="px-4 pb-8 sm:px-6 lg:px-8">
            {actionData ? (
              <div>
                <p>{actionData.resetPasswordHref}</p>
                <p>
                  Expires at{" "}
                  {new Date(actionData.resetPasswordExpireAt).toLocaleString()}
                </p>
              </div>
            ) : (
              "Already generated."
            )}
          </div>
        </Card>
      </Main>
    </>
  );
}

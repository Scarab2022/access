import { json, LoaderFunction } from "@remix-run/node";
import { useFormAction, useLoaderData, useSubmit } from "@remix-run/react";
import { Button } from "~/components/button";
import { prisma } from "~/db.server";
import type { User } from "@prisma/client";
import invariant from "tiny-invariant";
import { requireUserIdForRole } from "~/session.server";
import { Table } from "~/components/table";
import { Section } from "~/components/section";
import { PageHeader } from "~/components/page-header";

type LoaderData = {
  customer: Awaited<ReturnType<typeof getCustomer>>;
};

function getCustomer(id: User["id"]) {
  return prisma.user.findFirst({
    where: { id },
    include: {
      accessUsers: {
        where: { deletedAt: new Date(0) },
        orderBy: { name: "asc" },
      },
      accessHubs: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { customerId },
}) => {
  await requireUserIdForRole(request, "admin");
  invariant(customerId, "customerId not found");
  const customer = await getCustomer(customerId);
  return json<LoaderData>({ customer });
};

function codeActivateExpireStatus(
  accessUser: LoaderData["customer"]["accessUsers"][number]
) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activateCodeAt = accessUser.activateCodeAt
    ? new Date(accessUser.activateCodeAt)
    : null;
  const expireCodeAt = accessUser.expireCodeAt
    ? new Date(accessUser.expireCodeAt)
    : null;
  const now = Date.now();

  const codeStatus =
    expireCodeAt && now > expireCodeAt.getTime()
      ? "EXPIRED"
      : activateCodeAt && now < activateCodeAt.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expireCodeAt
        ? `Will expire at ${expireCodeAt.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expireCodeAt
        ? `Will activate at ${activateCodeAt?.toLocaleString()} until ${expireCodeAt.toLocaleString()}.`
        : `Will activate at ${activateCodeAt?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const resetPasswordAction = useFormAction("resetpassword");
  return (
    <>
      <PageHeader
        title={customer.email}
        side={
          <Button
            onClick={() => {
              submit(null, { method: "post", action: resetPasswordAction });
            }}
          >
            Reset Password
          </Button>
        }
      />
      <main className="space-y-6 ">
        <Section>
          <Section.Header>Access Hubs</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Heartbeat At</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {customer.accessHubs.map((i) => (
              <tr key={i.id}>
                <Table.Td prominent>{i.name}</Table.Td>
                <Table.Td>{i.id}</Table.Td>
                <Table.Td>{i.description}</Table.Td>
                <Table.Td>
                  {i.heartbeatAt && new Date(i.heartbeatAt).toLocaleString()}
                </Table.Td>
                <Table.TdLink to={`hubs/${i.id}`}>
                  View<span className="sr-only">, {i.name}</span>
                </Table.TdLink>
              </tr>
            ))}
          </Table>
        </Section>
        <Section>
          <Section.Header>Access Users</Section.Header>
          <Table
            headers={
              <>
                <Table.Th>Name</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Code Status</Table.Th>
                <Table.Th>Activate Expire Status</Table.Th>
                <Table.Th sr>View</Table.Th>
              </>
            }
          >
            {customer.accessUsers.map((i) => {
              const { codeStatus, activateExpireStatus } =
                codeActivateExpireStatus(i);
              return (
                <tr key={i.id}>
                  <Table.Td prominent>{i.name}</Table.Td>
                  <Table.Td>{i.id}</Table.Td>
                  <Table.Td>{i.code}</Table.Td>
                  <Table.Td>{codeStatus}</Table.Td>
                  <Table.Td>{activateExpireStatus}</Table.Td>
                  <Table.TdLink to={`users/${i.id}`}>View</Table.TdLink>
                </tr>
              );
            })}
          </Table>
        </Section>
      </main>
    </>
  );
}

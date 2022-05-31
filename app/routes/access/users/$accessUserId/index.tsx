import { json, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useFormAction,
} from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Button } from "~/components/button";
import { PencilIcon } from "@heroicons/react/solid";
import invariant from "tiny-invariant";
import { getAccessUserWithPoints } from "~/models/accessUser.server";
import { PageHeader } from "~/components/page-header";
import { Table } from "~/components/table";
import { Section } from "~/components/section";
import { DescriptionList } from "~/components/description-list";

type LoaderData = {
  accessUser: Awaited<ReturnType<typeof getAccessUserWithPoints>>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessUserId, "accessUserId not found");
  const accessUser = await getAccessUserWithPoints({
    id: Number(accessUserId),
    userId,
  });
  return json<LoaderData>({ accessUser });
};

function codeActivateExpireStatus(accessUser: LoaderData["accessUser"]) {
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
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("points");
  const { accessUser } = useLoaderData<LoaderData>();
  const { codeStatus, activateExpireStatus } =
    codeActivateExpireStatus(accessUser);
  return (
    <>
      <PageHeader
        title={accessUser.name}
        side={
          <Button onClick={() => navigate("edit")}>
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Edit
          </Button>
        }
      />
      <main className="space-y-6">
        <Section className="mx-auto max-w-lg">
          <DescriptionList>
            <DescriptionList.Item term="Code" description={accessUser.code} />
            <DescriptionList.Item term="Code Status" description={codeStatus} />
            <DescriptionList.Item
              term="ID"
              description={accessUser.id.toString()}
            />
            <DescriptionList.Item
              term="Activate Expire Status"
              description={activateExpireStatus}
            />
            <DescriptionList.Item
              term="Description"
              description={accessUser.description}
            />
          </DescriptionList>
        </Section>
        <Section>
          <Section.Header
            side={<Button onClick={() => navigate("points/add")}>Add</Button>}
          >
            Access Points
          </Section.Header>
          <Section.Content>
            <Table
              headers={
                <>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Hub</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th sr>View</Table.Th>
                </>
              }
            >
              {accessUser.accessPoints.map((i) => (
                <tr key={i.id}>
                  <Table.Td prominent>{i.name}</Table.Td>
                  <Table.Td>{i.accessHub.name}</Table.Td>
                  <Table.Td>{i.description}</Table.Td>
                  <Table.TdLink
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      submit(null, {
                        method: "post",
                        action: `${removeFormActionBase}/${i.id}/remove`,
                      });
                    }}
                  >
                    Remove
                  </Table.TdLink>
                </tr>
              ))}
            </Table>
          </Section.Content>
        </Section>
      </main>
    </>
  );
}

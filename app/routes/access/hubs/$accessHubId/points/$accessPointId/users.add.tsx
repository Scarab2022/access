import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserIdForRole } from "~/session.server";
import {
  getAccessPoint,
  getAccessPointWithHubAndUsers,
} from "~/models/accessPoint.server";
import invariant from "tiny-invariant";
import type { User } from "@prisma/client";
import { PageHeader } from "~/components/page-header";
import { Form } from "~/components/form";
import { Checkbox } from "~/components/checkbox";

export const handle = {
  breadcrumb: "Add Users",
};

type LoaderData = {
  accessUsers: Awaited<ReturnType<typeof getAccessUsers>>;
};

function getAccessUsers({
  notIn,
  userId,
}: {
  notIn: number[];
  userId: User["id"];
}) {
  return prisma.accessUser.findMany({
    where: {
      id: { notIn },
      deletedAt: new Date(0),
      user: { id: userId },
    },
  });
}

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId, accessPointId },
}): Promise<LoaderData> => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessHubId, "accessHubId not found");
  invariant(accessPointId, "accessPointId not found");

  const accessPoint = await getAccessPointWithHubAndUsers({
    id: Number(accessPointId),
    userId,
  });
  const notIn = accessPoint.accessUsers.map((el) => el.id);
  const accessUsers = await getAccessUsers({ notIn, userId });
  return { accessUsers };
};

export const action: ActionFunction = async ({
  request,
  params: { accessHubId, accessPointId },
}) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(accessHubId, "accessHubId not found");
  invariant(accessPointId, "accessPointId not found");

  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let ids = [];
  for (let idx = 0; fieldValues[`accessUser-${idx}-id`]; ++idx) {
    if (fieldValues[`accessUser-${idx}`]) {
      ids.push(Number(fieldValues[`accessUser-${idx}-id`]));
    }
  }
  if (ids.length > 0) {
    const accessPoint = await getAccessPoint({
      id: Number(accessPointId),
      accessHubId,
      userId,
    });

    // TODO: validate the access user id's: that they belong to the user
    await prisma.accessPoint.update({
      where: { id: accessPoint.id },
      data: { accessUsers: { connect: ids.map((id) => ({ id })) } },
    });
  }
  return redirect(`/access/hubs/${accessHubId}/points/${accessPointId}`);
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  return (
    <>
      <PageHeader />
      <main>
        <Form replace method="post" className="mx-auto max-w-sm">
          <Form.Content>
            <Form.Section>
              <Form.SectionHeader title="Add Users" />
              <Form.SectionContent>
                <Form.List>
                  {accessUsers.map((i, idx) => {
                    const idName = `accessUser-${idx}`;
                    const hiddenIdName = `${idName}-id`;
                    return (
                      <Checkbox.ListItem
                        key={i.id}
                        labelProps={{
                          htmlFor: idName,
                          children: i.name,
                        }}
                        checkboxProps={{ id: idName, name: idName }}
                      >
                        <input
                          id={hiddenIdName}
                          name={hiddenIdName}
                          type="hidden"
                          value={i.id}
                        />
                      </Checkbox.ListItem>
                    );
                  })}
                </Form.List>
              </Form.SectionContent>
            </Form.Section>
          </Form.Content>
          <Form.Footer>
            <Form.CancelButton />
            <Form.SubmitButton>Add</Form.SubmitButton>
          </Form.Footer>
        </Form>
      </main>
    </>
  );
}

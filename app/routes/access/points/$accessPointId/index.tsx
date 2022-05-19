import { LoaderFunction, json } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useNavigate,
  useSubmit,
  useFormAction,
} from "@remix-run/react";
import { requireUserIdForRole } from "~/session.server";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Fragment } from "react";
import {
  Button,
  Table,
  TdProminent,
  Td,
  Th,
  ThSr,
  TdLink,
  Main,
  DlCard,
  DlCardDtDd,
  Card,
} from "~/components/lib";
import invariant from "tiny-invariant";
import { getAccessPointWithHubAndUsers } from "~/models/accessPoint.server";
import { classNames } from "~/utils";
import { PageHeader } from "~/components/page-header";

type LoaderData = {
  accessPoint: Awaited<ReturnType<typeof getAccessPointWithHubAndUsers>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserIdForRole(request, "customer");
  invariant(params.accessPointId, "accessPointId not found");
  const accessPoint = await getAccessPointWithHubAndUsers({
    id: Number(params.accessPointId),
    userId,
  });
  return json<LoaderData>({ accessPoint });
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("users");
  return (
    <>
      <PageHeader
        title={accessPoint.name}
        meta={
          accessPoint.description ? (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <LocationMarkerIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {accessPoint.description}
              </div>
            </div>
          ) : null
        }
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="sm:ml-3">
              <Button onClick={() => navigate("edit")}>
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </Button>
            </span>

            {/* Dropdown */}
            <Menu as="span" className="relative ml-3 sm:hidden">
              <Menu.Button as={Fragment}>
                <Button variant="white">
                  More
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Button>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="raw"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Raw
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="activity"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Activity
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </>
        }
      />
      <Main>
        <DlCard>
          <DlCardDtDd term="Hub" description={accessPoint.accessHub.name} />
          <DlCardDtDd term="ID" description={accessPoint.id.toString()} />
          <DlCardDtDd
            term="Position"
            description={accessPoint.position.toString()}
          />
          <DlCardDtDd
            term="Heartbeat"
            description={
              accessPoint.accessHub.heartbeatAt
                ? new Date(accessPoint.accessHub.heartbeatAt).toLocaleString()
                : ""
            }
          />
          <DlCardDtDd
            wide={true}
            term="Description"
            description={accessPoint.description}
          />
        </DlCard>
        <Card
          title="Users With Access"
          side={<Button onClick={() => navigate("users/add")}>Add</Button>}
        >
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Code</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessPoint.accessUsers.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.description}</Td>
                <Td>{i.code}</Td>
                <TdLink
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
                </TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}

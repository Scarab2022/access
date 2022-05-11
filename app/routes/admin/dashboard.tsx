import { LoaderFunction } from "@remix-run/node";
import { Header } from "~/components/lib";
import { requireUserIdForRole } from "~/session.server";

export const handle = {
  breadcrumb: "Dashboard",
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserIdForRole(request, "admin");
  return null;
};

export default function RouteComponent() {
  return (
      <>
      <Header title="Dashboard" />
      </>
  )
}

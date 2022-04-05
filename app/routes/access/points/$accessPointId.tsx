import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Access Point",
};

export default function RouteComponent() {
  return <Outlet />;
}

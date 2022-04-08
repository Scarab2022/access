import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Access User",
};

export default function RouteComponent() {
  return <Outlet />;
}

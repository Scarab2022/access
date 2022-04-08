import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Access Hub",
};

export default function RouteComponent() {
  return <Outlet />;
}

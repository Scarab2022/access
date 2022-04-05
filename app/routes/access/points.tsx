import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: "Points",
};

export default function RouteComponent() {
  return <Outlet />;
}

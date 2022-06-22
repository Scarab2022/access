import type { useMatches } from "@remix-run/react";
import { Link, Outlet } from "@remix-run/react";
import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from "~/components/boundaries";
import { HomeIcon } from "@heroicons/react/solid";
import { Navbar } from "~/components/navbar";

export const handle = {
  breadcrumb: (match: ReturnType<typeof useMatches>[number]) => (
    // Don't link to match.pathname.
    <Link to="/" className="text-gray-400 hover:text-gray-500">
      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="sr-only">Home</span>
    </Link>
  ),
};

const navigation = [
  { name: "Dashboard", href: "dashboard" },
  { name: "Customers", href: "customers" },
];

function Layout({ children }: { children: React.ReactNode }) {
  // With page heading and stacked list
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  return (
    <div className="mx-auto min-h-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <Navbar navigation={navigation} userNavigation={[]} />
      {children}
    </div>
  );
}

export default function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function CatchBoundary() {
  return (
    <Layout>
      <GenericCatchBoundary />
    </Layout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Layout>
      <GenericErrorBoundary error={error} />
    </Layout>
  );
}

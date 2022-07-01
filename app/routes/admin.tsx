import type { useMatches } from "@remix-run/react";
import { Link, Outlet } from "@remix-run/react";
import {
  GenericCatchBoundary,
  GenericErrorBoundary,
} from "~/components/boundaries";
import { HomeIcon } from "@heroicons/react/solid";
import { Navbar } from "~/components/navbar";
import { Container } from "~/components/container";

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
    <Container className="min-h-full pb-8">
      <Navbar navigation={navigation} userNavigation={[]} />
      {children}
    </Container>
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

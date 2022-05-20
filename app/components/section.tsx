import React from "react";

function Section({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

Section.Header = function SectionHeader({
  side, // Should be fragment if more than 1 item for flex
  children,
}: {
  side?: React.ReactNode;
  children: React.ReactNode;
}) {
  // With actions
  // https://tailwindui.com/components/application-ui/headings/section-headings
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        {children}
      </h3>
      {side ? <div className="mt-3 flex sm:mt-0 sm:ml-4">{side}</div> : null}
    </div>
  );
};

Section.Body = function SectionBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-8">{children}</div>;
};

export { Section };

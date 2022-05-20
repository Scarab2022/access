import React from "react";

function Section({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

Section.Header = function SectionHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 pb-5">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        {children}
      </h3>
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

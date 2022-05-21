import React from "react";

function DescriptionList({ children }: { children: React.ReactNode }) {
  // Left aligned: https://tailwindui.com/components/application-ui/data-display/description-lists
  return <dl className="sm:divide-y sm:divide-gray-200">{children}</dl>;
}

DescriptionList.Group = function DescriptionListGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
      {children}
    </div>
  );
};

DescriptionList.Dt = function DescriptionListDt({
  children,
}: {
  children: React.ReactNode;
}) {
  return <dt className="text-sm font-medium text-gray-500">{children}</dt>;
};

DescriptionList.Dd = function DescriptionListDd({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
      {children}
    </dd>
  );
};

DescriptionList.Item = function DescriptionListItem({
  term,
  description,
}: {
  term: string;
  description: string;
}) {
  return (
    <DescriptionList.Group>
      <DescriptionList.Dt>{term}</DescriptionList.Dt>
      <DescriptionList.Dd>{description}</DescriptionList.Dd>
    </DescriptionList.Group>
  );
};

export { DescriptionList };

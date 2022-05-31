import React from "react";
import { classNames } from "~/utils";

function Section({ ...rest }: JSX.IntrinsicElements["div"]) {
  return <div {...rest} />;
}

Section.Header = function SectionHeader({
  side, // Should be fragment if more than 1 item for flex
  className,
  ...rest
}: {
  side?: React.ReactNode;
} & JSX.IntrinsicElements["h3"]) {
  // With actions
  // https://tailwindui.com/components/application-ui/headings/section-headings
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
      <h3
        className={classNames(
          className,
          "text-lg font-medium leading-6 text-gray-900"
        )}
        {...rest}
      />
      {side ? <div className="mt-3 flex sm:mt-0 sm:ml-4">{side}</div> : null}
    </div>
  );
};

Section.Content = function SectionContent({
  className,
  ...rest
}: JSX.IntrinsicElements["div"]) {
  return <div className={classNames(className, "mt-8")} {...rest} />;
};

export { Section };

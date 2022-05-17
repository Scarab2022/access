import { Switch } from "@headlessui/react";
import { classNames } from "~/utils";

type T = JSX.IntrinsicElements

function StyledSwitch({
  className,
  checked,
  children,
  ...props
}: Parameters<typeof Switch>[0]) {
  return (
    <Switch
      {...props}
      checked={checked}
      className={classNames(
        className,
        checked ? "bg-indigo-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      )}
      children={
        children ? (
          children
        ) : (
          <span
            aria-hidden="true"
            className={classNames(
              checked ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        )
      }
    />
  );
}

StyledSwitch.Group = function Group({
  as = "div",
  className,
  ...props
}: Parameters<typeof Switch.Group>[0]) {
  return (
    <Switch.Group
      {...props}
      as={as}
      className={className ? className : "flex items-center"}
    />
  );
};

StyledSwitch.Label = function Label({
  as = "span",
  className,
  ...props
}: Parameters<typeof Switch.Label>[0]) {
  return (
    <Switch.Label
      {...props}
      as={as}
      className={classNames(className, "text-sm font-medium text-gray-900")}
    />
  );
};

export { StyledSwitch };

import { classNames } from "~/utils";

function H3({ className, ...rest }: JSX.IntrinsicElements["h3"]) {
  return (
    <h3
      className={classNames(
        className,
        "text-lg font-medium leading-6 text-gray-900"
      )}
      {...rest}
    />
  );
}

export { H3 };

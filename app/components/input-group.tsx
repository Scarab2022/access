function InputGroup({ className, children }: JSX.IntrinsicElements["div"]) {
  // Input with label and help text
  // Input with validation error
  // https://tailwindui.com/components/application-ui/forms/input-groups
  return <div className={className}>{children}</div>;
}

export { InputGroup };

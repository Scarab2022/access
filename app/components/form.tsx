import { Form as RemixForm, useNavigate } from "@remix-run/react";
import { FormProps } from "@remix-run/react/components";
import React from "react";
import { classNames } from "~/utils";
import { Button } from "./button";

// TODO: Show errors for the entire form.
// formErrors={actionData?.formErrors?.formErrors}
function Form({ className, children, ...rest }: FormProps) {
  return (
    <RemixForm
      className={classNames(className, "space-y-8 divide-y divide-gray-200")}
      {...rest}
    >
      <div className="space-y-8 divide-y divide-gray-200">{children}</div>
    </RemixForm>
  );
}

Form.Section = function FormSection({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["div"]) {
  return (
    <div className={classNames(className, "pt-8 first:pt-0")} {...rest}>
      {children}
    </div>
  );
};

Form.H3 = function FormH3({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["h3"]) {
  return (
    <h3
      className={classNames(
        className,
        "text-lg font-medium leading-6 text-gray-900"
      )}
      {...rest}
    >
      {children}
    </h3>
  );
};

Form.SectionDescription = function FormSectionDescription({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["p"]) {
  return (
    <p
      className={classNames(className, "mt-1 text-sm text-gray-500")}
      {...rest}
    >
      {children}
    </p>
  );
};

Form.Grid = function FormGrid({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["div"]) {
  return (
    <div
      className={classNames(
        className,
        "mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6"
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

const groupSpan = {
  whole: "sm:col-span-6",
  half: "sm:col-span-3",
  third: "sm:col-span-2",
  "three-quarters": "sm:col-span-4",
} as const;

Form.Group = function FormGroup({
  span = "whole",
  children,
}: {
  span?: keyof typeof groupSpan;
} & JSX.IntrinsicElements["div"]) {
  return <div className={groupSpan[span]}>{children}</div>;
};

Form.Label = function FormLabel({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["label"]) {
  return (
    <label
      className={classNames(
        className,
        "block text-sm font-medium text-gray-700"
      )}
      {...rest}
    >
      {children}
    </label>
  );
};

Form.Control = function FormControl({
  className,
  children,
  validationError,
  ...rest
}: { validationError: boolean } & JSX.IntrinsicElements["div"]) {
  // Input with label and help text, Input with validation error
  // https://tailwindui.com/components/application-ui/forms/input-groups
  // <div class="mt-1">
  // <div class="relative mt-1 rounded-md shadow-sm">
  return (
    <div
      className={classNames(
        className,
        validationError ? "relative mt-1 rounded-md shadow-sm" : "mt-1"
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

Form.Input = function FormInput({
  className,
  validationError,
  ...rest
}: { validationError: boolean } & JSX.IntrinsicElements["input"]) {
  // Input with label and help text, Input with validation error
  // https://tailwindui.com/components/application-ui/forms/input-groups
  // <input type="email" name="email" id="email" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="you@example.com" aria-describedby="email-description">
  // <input type="email" name="email" id="email" class="block w-full rounded-md border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm" placeholder="you@example.com" value="adamwathan" aria-invalid="true" aria-describedby="email-error" />
  // Removed pr-10 from validationError
  return (
    <input
      className={classNames(
        className,
        "block w-full rounded-md sm:text-sm",
        validationError
          ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
          : "border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      )}
      {...rest}
    />
  );
};

Form.ValidationError = function FormValidationError({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["p"]) {
  return children ? (
    <p className={classNames(className, "mt-2 text-sm text-red-600")} {...rest}>
      {children}
    </p>
  ) : null;
};

Form.Errors = Form.ValidationError;

Form.Field = function FormField({
  id,
  label,
  children, // only 1 child.
  errors,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  errors?: string[];
}) {
  const child = React.Children.only(children);
  const validationError = Boolean(errors);
  return (
    <Form.Group>
      <Form.Label htmlFor={id}>{label}</Form.Label>
      <Form.Control validationError={validationError}>
        {React.isValidElement(child)
          ? React.cloneElement(child, {
              className: classNames(
                child.props.className,
                "block w-full rounded-md sm:text-sm",
                validationError
                  ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                  : "border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ),
            })
          : null}
      </Form.Control>
      {errors ? (
        <Form.ValidationError id={`${id}-error`} role="alert">
          {errors.join(". ")}
        </Form.ValidationError>
      ) : null}
    </Form.Group>
  );
};

Form.ButtonSection = function FormButtonSection({
  className,
  children,
  ...rest
}: JSX.IntrinsicElements["div"]) {
  return (
    <div className={classNames(className, "flex justify-end pt-5")} {...rest}>
      {children}
    </div>
  );
};

Form.SubmitButton = function FormSubmitButton({
  className,
  ...rest
}: Parameters<typeof Button>[0]) {
  return (
    <Button type="submit" className={classNames(className, "ml-3")} {...rest} />
  );
};

Form.CancelButton = function FormCancelButton({
  className,
  children,
  ...rest
}: Parameters<typeof Button>[0]) {
  const navigate = useNavigate();
  return (
    <Button
      variant="white"
      className={classNames(className, "ml-auto")}
      onClick={() => navigate(-1)}
      {...rest}
    >
      {children || "Cancel"}
    </Button>
  );
};
Form.DangerButton = function FormDangerButton({
  ...rest
}: Parameters<typeof Button>[0]) {
  return <Button variant="red" {...rest} />;
};

export { Form };

import { FormProps } from "@remix-run/react/components";
import React from "react";
import { Form, useCatch, useNavigate } from "@remix-run/react";
import { Button } from "./Button";

export function GenericCatchBoundary() {
  const caught = useCatch();
  return (
    <div className="py-16">
      <div className="prose mx-auto max-w-xl px-4">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        {typeof caught.data === "string" ? <pre>{caught.data}</pre> : null}
      </div>
    </div>
  );
}

export function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="py-16">
      <div className="prose mx-auto max-w-xl px-4">
        <h1>Application Error</h1>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}

export function DlCardDtDd({
  term,
  description,
  wide = false,
}: {
  term: string;
  description: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : "sm:col-span-1"}>
      <dt className="text-sm font-medium text-gray-500">{term}</dt>
      <dd className="mt-1 text-sm text-gray-900">{description}</dd>
    </div>
  );
}

export function DlCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl border-t border-gray-200 bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6 lg:px-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

export function Card({
  title,
  side,
  children,
}: {
  title: string;
  side?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
      <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">{title}</h2>
        {side ? <div className="mt-5 flex lg:mt-0 lg:ml-4">{side}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function SettingsFormField({
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
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        {React.isValidElement(child)
          ? React.cloneElement(child, {
              className:
                "block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md",
            })
          : null}
      </div>
      {errors ? (
        <p
          className="mt-2 text-sm text-red-600"
          role="alert"
          id={`${id}-error`}
        >
          {errors.join(". ")}
        </p>
      ) : null}
    </div>
  );
}

export function SettingsForm({
  title,
  formErrors,
  submitText = "Save",
  submitOnClick,
  leftButton,
  children,
  ...props
}: {
  title: string;
  formErrors?: string[];
  submitText?: string;
  submitOnClick?: React.DOMAttributes<HTMLButtonElement>["onClick"];
  leftButton?: React.ReactNode;
  children: React.ReactNode;
} & FormProps) {
  const navigate = useNavigate();
  const submitCancelButtons = (
    <div className="flex justify-end">
      <Button variant="white" onClick={() => navigate(-1)}>
        Cancel
      </Button>
      <Button type="submit" className="ml-3" onClick={submitOnClick}>
        {submitText}
      </Button>
    </div>
  );
  return (
    <section className="mx-auto max-w-lg lg:px-8">
      <Form className="shadow sm:overflow-hidden sm:rounded-md" {...props}>
        <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
          <div>
            <h1 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h1>
            {formErrors ? (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.join(". ")}
              </p>
            ) : null}
          </div>
          {children}

          {leftButton ? (
            <div className="flex justify-between">
              {leftButton}
              {submitCancelButtons}
            </div>
          ) : (
            submitCancelButtons
          )}
        </div>
      </Form>
    </section>
  );
}

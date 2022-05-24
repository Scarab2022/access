import { useNavigate, Form } from "@remix-run/react";
import { FormProps } from "@remix-run/react/components";
import React from "react";
import { classNames } from "~/utils";
import { Button } from "./button";

function SettingsForm_({
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
    // Simple stacked: https://tailwindui.com/components/application-ui/forms/form-layouts
    <Form className="space-y-8 divide-y divide-gray-200" {...props}>
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <h1 className="text-lg font-medium leading-6 text-gray-900">
            {title}
          </h1>
          {formErrors ? (
            <p className="mt-1 text-sm text-red-600">{formErrors.join(". ")}</p>
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
  );
}

function SettingsFormRoot({ className, children, ...rest }: FormProps) {
  // Simple stacked: https://tailwindui.com/components/application-ui/forms/form-layouts
  return (
    <Form
      className={classNames(className, "space-y-8 divide-y divide-gray-200")}
      {...rest}
    >
      <div className="space-y-8 divide-y divide-gray-200">{children}</div>
    </Form>
  );
}

function SectionRoot({ children }: { children: React.ReactNode }) {
  return <div className="pt-8 first:pt-0">{children}</div>;
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        {children}
      </h3>
    </div>
  );
}

// export { SettingsForm };
const Section = Object.assign(SectionRoot, { Header });
export const SettingsForm = Object.assign(SettingsFormRoot, { Section });

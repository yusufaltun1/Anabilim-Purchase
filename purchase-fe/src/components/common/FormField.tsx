import { ReactNode } from 'react';
import { formLabel } from './formStyles';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, required, hint, className = '', children }: FormFieldProps) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={formLabel}>
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection = ({ title, description, children }: FormSectionProps) => (
  <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="border-b border-gray-100 px-5 py-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
    </div>
    <div className="px-5 py-5">{children}</div>
  </section>
);

interface InputWithButtonProps {
  children: ReactNode;
  button: ReactNode;
}

export const InputWithButton = ({ children, button }: InputWithButtonProps) => (
  <div className="flex gap-2 items-center">
    <div className="min-w-0 flex-1">{children}</div>
    {button}
  </div>
);

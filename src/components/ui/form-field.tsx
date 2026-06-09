"use client";

import * as React from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

let nextId = 0;
const makeId = () => {
  nextId += 1;
  return `ff-${nextId}`;
};

/**
 * Combined label + input + error message with full a11y wiring.
 *
 * The input announces invalid state via `aria-invalid` *and* links to the
 * error paragraph via `aria-describedby` — screen readers read the message,
 * not just "invalid". Replaces the manual `<Label>{f.name}<Input aria-invalid=...
 * {...register("name")}/></Label>` pattern that's repeated in every form.
 *
 * Pass the RHF `register("name")` result via `inputProps` (the spread of
 * register includes ref / name / onChange / onBlur).
 *
 * @example
 * <FormField
 *   label={f.name}
 *   placeholder={f.name_placeholder}
 *   error={errors.name?.message}
 *   inputProps={register("name")}
 * />
 */
export interface FormFieldProps extends Omit<
  InputProps,
  "id" | "aria-invalid" | "aria-describedby"
> {
  /** Localised label text. Required for a11y. */
  label: React.ReactNode;
  /** RHF error message (e.g. `errors.name?.message`). When set, the field is rendered as invalid. */
  error?: string;
  /** Spread RHF's `register("name")` here. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    name?: string;
    ref?: React.Ref<HTMLInputElement>;
  };
  /** Wrap class for the outer Label. */
  labelClassName?: string;
  /** Optional hint shown under the input (above the error, when both present). */
  hint?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, inputProps, hint, labelClassName, className, ...rest },
  ref,
) {
  const [id] = React.useState(makeId);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Label className={cn("flex flex-col gap-2", labelClassName)}>
      {label}
      <Input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={className}
        {...rest}
        {...inputProps}
      />
      {hint && (
        <span id={hintId} className="text-xs text-[#585757]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </Label>
  );
});

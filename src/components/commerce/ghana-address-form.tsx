"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export type GhanaAddressValues = {
  fullName: string;
  phone: string;
  region: string;
  cityTown: string;
  areaSuburb: string;
  streetLandmark: string;
  ghanapostGps: string;
  deliveryInstructions: string;
  deliveryArea: "accra" | "tema" | "other";
};

const empty: GhanaAddressValues = {
  fullName: "",
  phone: "",
  region: "",
  cityTown: "",
  areaSuburb: "",
  streetLandmark: "",
  ghanapostGps: "",
  deliveryInstructions: "",
  deliveryArea: "accra",
};

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-sm text-slate">{hint}</p> : null}
    </div>
  );
}

export function GhanaAddressForm({
  id = "ghana-address",
  defaultValues,
  action,
  children,
  submitLabel,
  submitDisabled,
}: {
  id?: string;
  defaultValues?: Partial<GhanaAddressValues>;
  action?: ComponentProps<"form">["action"];
  children?: ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
}) {
  const [values, setValues] = useState<GhanaAddressValues>({
    ...empty,
    ...defaultValues,
  });

  function patch<K extends keyof GhanaAddressValues>(
    key: K,
    value: GhanaAddressValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      id={id}
      className="space-y-4 border border-border bg-card p-5"
      action={action}
      encType="multipart/form-data"
      onSubmit={action ? undefined : (event) => event.preventDefault()}
    >
      <input type="hidden" name="deliveryArea" value={values.deliveryArea} />
      <Field id={`${id}-name`} label="Full Name" required>
        <Input
          id={`${id}-name`}
          name="fullName"
          autoComplete="name"
          required
          value={values.fullName}
          onChange={(event) => patch("fullName", event.target.value)}
        />
      </Field>
      <Field
        id={`${id}-phone`}
        label="Phone Number"
        required
        hint="We use this to confirm delivery."
      >
        <Input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          className="h-12 text-lg"
          value={values.phone}
          onChange={(event) => patch("phone", event.target.value)}
        />
      </Field>
      <Field id={`${id}-region`} label="Region" required>
        <Input
          id={`${id}-region`}
          name="region"
          required
          value={values.region}
          onChange={(event) => patch("region", event.target.value)}
        />
      </Field>
      <Field id={`${id}-city`} label="City / Town" required>
        <Input
          id={`${id}-city`}
          name="cityTown"
          required
          value={values.cityTown}
          onChange={(event) => patch("cityTown", event.target.value)}
        />
      </Field>
      <Field id={`${id}-area`} label="Area / Suburb">
        <Input
          id={`${id}-area`}
          name="areaSuburb"
          value={values.areaSuburb}
          onChange={(event) => patch("areaSuburb", event.target.value)}
        />
      </Field>
      <Field id={`${id}-street`} label="Street / Landmark">
        <Input
          id={`${id}-street`}
          name="streetLandmark"
          value={values.streetLandmark}
          onChange={(event) => patch("streetLandmark", event.target.value)}
        />
      </Field>
      <Field
        id={`${id}-gps`}
        label="GhanaPost GPS"
        hint="Optional. Example: GA-123-4567"
      >
        <Input
          id={`${id}-gps`}
          name="ghanapostGps"
          className="font-mono"
          placeholder="GA-123-4567"
          value={values.ghanapostGps}
          onChange={(event) => patch("ghanapostGps", event.target.value)}
        />
      </Field>
      <Field id={`${id}-notes`} label="Delivery Instructions">
        <Textarea
          id={`${id}-notes`}
          name="deliveryInstructions"
          value={values.deliveryInstructions}
          onChange={(event) =>
            patch("deliveryInstructions", event.target.value)
          }
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Delivery Area</legend>
        <RadioGroup
          value={values.deliveryArea}
          onValueChange={(value) =>
            patch("deliveryArea", value as GhanaAddressValues["deliveryArea"])
          }
        >
          {(
            [
              ["accra", "Accra"],
              ["tema", "Tema"],
              ["other", "Other Region"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm text-graphite"
            >
              <RadioGroupItem value={value} className="accent-ink" />
              {label}
            </label>
          ))}
        </RadioGroup>
        {values.deliveryArea === "other" ? (
          <p className="text-sm text-slate">
            We&apos;ll contact you to confirm the best nationwide delivery option
            and cost.
          </p>
        ) : null}
      </fieldset>
      {children}
      {submitLabel ? (
        <button type="submit" className={paperButton()} disabled={submitDisabled}>
          {submitLabel}
        </button>
      ) : null}
    </form>
  );
}

"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
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
  busy = false,
  fieldErrors,
  savedAddresses,
}: {
  id?: string;
  defaultValues?: Partial<GhanaAddressValues>;
  action?: ComponentProps<"form">["action"];
  children?: ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
  busy?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  savedAddresses?: Array<{ id: string; label: string; values: Partial<GhanaAddressValues> }>;
}) {
  const [values, setValues] = useState<GhanaAddressValues>(() => ({
    ...empty,
    ...defaultValues,
  }));
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function applySavedAddress(id: string) {
    setSelectedAddressId(id);
    const address = savedAddresses?.find((entry) => entry.id === id);
    if (address) {
      setValues((current) => ({ ...current, ...address.values }));
    } else {
      setValues(empty);
    }
  }

  function patch<K extends keyof GhanaAddressValues>(
    key: K,
    value: GhanaAddressValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function errorProps(key: keyof GhanaAddressValues) {
    return {
      "aria-invalid": fieldErrors?.[key]?.length ? true : undefined,
      "aria-describedby": fieldErrors?.[key]?.length ? `${id}-${key}-error` : undefined,
    };
  }

  return (
    <form
      id={id}
      data-hydrated={hydrated ? "true" : "false"}
      className="space-y-4 border border-border bg-card p-5"
      action={action}
      aria-busy={busy}
      encType={typeof action === "function" ? undefined : "multipart/form-data"}
      onSubmit={action ? undefined : (event) => event.preventDefault()}
    >
      <input type="hidden" name="deliveryArea" value={values.deliveryArea} />
      {savedAddresses?.length ? <Field id={`${id}-saved`} label="Saved address"><select id={`${id}-saved`} value={selectedAddressId} onChange={(event) => applySavedAddress(event.target.value)} className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink"><option value="">Enter a new address</option>{savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.label}</option>)}</select></Field> : null}
      <Field id={`${id}-name`} label="Full Name" required>
        <Input
          id={`${id}-name`}
          name="fullName"
          {...errorProps("fullName")}
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
          {...errorProps("phone")}
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
          {...errorProps("region")}
          autoComplete="address-level1"
          required
          value={values.region}
          onChange={(event) => patch("region", event.target.value)}
        />
      </Field>
      <Field id={`${id}-city`} label="City / Town" required>
        <Input
          id={`${id}-city`}
          name="cityTown"
          {...errorProps("cityTown")}
          autoComplete="address-level2"
          required
          value={values.cityTown}
          onChange={(event) => patch("cityTown", event.target.value)}
        />
      </Field>
      <Field id={`${id}-area`} label="Area / Suburb">
        <Input
          id={`${id}-area`}
          name="areaSuburb"
          {...errorProps("areaSuburb")}
          autoComplete="address-level3"
          value={values.areaSuburb}
          onChange={(event) => patch("areaSuburb", event.target.value)}
        />
      </Field>
      <Field id={`${id}-street`} label="Street / Landmark">
        <Input
          id={`${id}-street`}
          name="streetLandmark"
          {...errorProps("streetLandmark")}
          autoComplete="street-address"
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
          {...errorProps("ghanapostGps")}
          autoComplete="postal-code"
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
          {...errorProps("deliveryInstructions")}
          value={values.deliveryInstructions}
          onChange={(event) =>
            patch("deliveryInstructions", event.target.value)
          }
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Delivery Area</legend>
        <RadioGroup
          {...errorProps("deliveryArea")}
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
      {Object.entries(fieldErrors ?? {}).map(([key, errors]) => errors?.length ? (
        <p key={key} id={`${id}-${key}-error`} className="text-sm text-error">{errors.join(" ")}</p>
      ) : null)}
      {children}
      {submitLabel ? (
        <button type="submit" className={paperButton({ className: "disabled:cursor-wait" })} disabled={submitDisabled || !hydrated} aria-busy={busy}>
          {submitLabel}
        </button>
      ) : null}
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type ProviderInquiryInput,
  providerInquirySchema,
} from "@/lib/validation/provider-inquiry";

export function ProviderInquiryForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProviderInquiryInput>({
    resolver: zodResolver(providerInquirySchema),
    defaultValues: {
      contactName: "",
      businessName: "",
      email: "",
      phone: "",
      sector: "Barber / salon",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");

    const response = await fetch("/api/provider-inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset();
  });

  return (
    <Card tone="soft" className="p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Provider inquiry
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
          Tell us how your reservation workflow works today
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
          This keeps onboarding grounded in your actual business constraints,
          not a generic booking script.
        </p>
      </div>
      <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Contact name"
            error={errors.contactName?.message}
            {...register("contactName")}
          />
          <Input
            label="Business or brand"
            error={errors.businessName?.message}
            {...register("businessName")}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Email" error={errors.email?.message} {...register("email")} />
          <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
        </div>
        <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
          <span className="font-medium">Sector</span>
          <select
            {...register("sector")}
            className="h-12 rounded-[16px] border border-transparent bg-[var(--color-surface)] px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          >
            <option>Barber / salon</option>
            <option>Dental / health</option>
            <option>Beauty / wellness</option>
            <option>Maintenance / repair</option>
            <option>Consultation / advisory</option>
          </select>
          {errors.sector?.message ? (
            <span className="text-xs text-[var(--color-error)]">
              {errors.sector.message}
            </span>
          ) : null}
        </label>
        <Textarea
          label="Current workflow"
          error={errors.message?.message}
          placeholder="Explain how reservations are handled today, where coordination breaks, and what flexibility you need."
          {...register("message")}
        />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-[var(--color-ink-muted)]">
            {status === "success" && "Your inquiry was accepted for provider follow-up."}
            {status === "error" && "Something went wrong. Please retry."}
            {status === "idle" && "This form is for provider onboarding, not consumer support."}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send provider inquiry"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

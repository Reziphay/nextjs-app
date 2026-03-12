"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";

import { trackEvent } from "@/features/analytics/track";
import {
  providerInterestSchema,
  type ProviderInterestValues,
} from "@/features/forms/schemas";
import { HONEYPOT_FIELD_NAME } from "@/features/forms/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProviderInterestForm() {
  const [serverMessage, setServerMessage] = useState<{
    tone: "error" | "success";
    value: string;
  } | null>(null);

  const form = useForm<ProviderInterestValues>({
    resolver: zodResolver(providerInterestSchema),
    defaultValues: {
      businessName: "",
      category: "",
      city: "",
      details: "",
      email: "",
      fullName: "",
      phone: "",
      teamSize: "",
      [HONEYPOT_FIELD_NAME]: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerMessage(null);

    const response = await fetch("/api/provider-interest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      startTransition(() => {
        setServerMessage({
          tone: "error",
          value:
            payload?.error?.message ??
            "The request could not be submitted. Please try again.",
        });
      });
      return;
    }

    form.reset();
    trackEvent("provider_interest_submit", {
      category: values.category,
      city: values.city,
    });

    startTransition(() => {
      setServerMessage({
        tone: "success",
        value: "Thanks. Your provider interest has been recorded.",
      });
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider-full-name">
            Full name
          </label>
          <Input id="provider-full-name" {...form.register("fullName")} />
          <p className="text-xs text-danger">
            {form.formState.errors.fullName?.message}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider-email">
            Email
          </label>
          <Input id="provider-email" type="email" {...form.register("email")} />
          <p className="text-xs text-danger">{form.formState.errors.email?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider-business-name">
            Brand or business name
          </label>
          <Input id="provider-business-name" {...form.register("businessName")} />
          <p className="text-xs text-danger">
            {form.formState.errors.businessName?.message}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider-category">
            Service category
          </label>
          <Input id="provider-category" {...form.register("category")} />
          <p className="text-xs text-danger">
            {form.formState.errors.category?.message}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <label className="text-sm font-medium" htmlFor="provider-city">
            City
          </label>
          <Input id="provider-city" {...form.register("city")} />
          <p className="text-xs text-danger">{form.formState.errors.city?.message}</p>
        </div>
        <div className="space-y-2 sm:col-span-1">
          <label className="text-sm font-medium" htmlFor="provider-team-size">
            Team size
          </label>
          <Input id="provider-team-size" {...form.register("teamSize")} />
          <p className="text-xs text-danger">
            {form.formState.errors.teamSize?.message}
          </p>
        </div>
        <div className="space-y-2 sm:col-span-1">
          <label className="text-sm font-medium" htmlFor="provider-phone">
            Phone
          </label>
          <Input id="provider-phone" {...form.register("phone")} />
          <p className="text-xs text-danger">{form.formState.errors.phone?.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="provider-details">
          How do you want to use Reziphay?
        </label>
        <Textarea id="provider-details" {...form.register("details")} />
        <p className="text-xs text-danger">{form.formState.errors.details?.message}</p>
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="provider-website">Leave this field empty</label>
        <Input
          autoComplete="off"
          id="provider-website"
          tabIndex={-1}
          {...form.register(HONEYPOT_FIELD_NAME)}
        />
      </div>

      {serverMessage ? (
        <div
          className={
            serverMessage.tone === "success"
              ? "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
              : "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
          }
        >
          {serverMessage.value}
        </div>
      ) : null}

      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Submitting..." : "Submit provider interest"}
      </Button>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";

import { trackEvent } from "@/features/analytics/track";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/features/forms/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const selectClassName =
  "flex h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[var(--ring)]";

interface ContactFormProps {
  defaultInterest?: ContactFormValues["interest"];
}

export function ContactForm({
  defaultInterest = "general",
}: ContactFormProps) {
  const [serverMessage, setServerMessage] = useState<{
    tone: "error" | "success";
    value: string;
  } | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      company: "",
      email: "",
      fullName: "",
      interest: defaultInterest,
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerMessage(null);

    const response = await fetch("/api/contact", {
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
            "The message could not be sent. Please try again.",
        });
      });
      return;
    }

    form.reset({
      company: "",
      email: "",
      fullName: "",
      interest: defaultInterest,
      message: "",
    });

    trackEvent("contact_form_submit", {
      interest: values.interest,
    });

    startTransition(() => {
      setServerMessage({
        tone: "success",
        value: "Thanks. The team can now follow up on your request.",
      });
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-full-name">
            Full name
          </label>
          <Input id="contact-full-name" {...form.register("fullName")} />
          <p className="text-xs text-danger">
            {form.formState.errors.fullName?.message}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-email">
            Email
          </label>
          <Input id="contact-email" type="email" {...form.register("email")} />
          <p className="text-xs text-danger">{form.formState.errors.email?.message}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-company">
            Company or brand
          </label>
          <Input id="contact-company" {...form.register("company")} />
          <p className="text-xs text-danger">
            {form.formState.errors.company?.message}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="contact-interest">
            What is this about?
          </label>
          <select
            className={selectClassName}
            id="contact-interest"
            {...form.register("interest")}
          >
            <option value="general">General inquiry</option>
            <option value="app-download">App launch updates</option>
            <option value="provider-partnership">Provider partnership</option>
            <option value="customer-support">Customer support</option>
          </select>
          <p className="text-xs text-danger">
            {form.formState.errors.interest?.message}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="contact-message">
          Message
        </label>
        <Textarea id="contact-message" {...form.register("message")} />
        <p className="text-xs text-danger">{form.formState.errors.message?.message}</p>
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
        {form.formState.isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}


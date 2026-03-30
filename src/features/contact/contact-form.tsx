"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ContactInput, contactSchema } from "@/lib/validation/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "General support",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("idle");

    const response = await fetch("/api/contact", {
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
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Full name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" error={errors.email?.message} {...register("email")} />
        </div>
        <Input label="Topic" error={errors.topic?.message} {...register("topic")} />
        <Textarea label="Message" error={errors.message?.message} {...register("message")} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-[var(--color-ink-muted)]">
            {status === "success" && "Your message was accepted for follow-up."}
            {status === "error" && "Something went wrong. Please retry."}
            {status === "idle" && "We keep this contact flow lightweight and direct."}
          </div>
          <Button type="submit" fullWidth={false} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send message"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type AdminLoginInput,
  adminLoginSchema,
} from "@/lib/validation/admin-auth";

type AdminLoginFormProps = {
  nextPath: string;
  adminRoute: string;
};

export function AdminLoginForm({
  adminRoute,
  nextPath,
}: AdminLoginFormProps) {
  const [submitError, setSubmitError] = useState("");

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, nextPath }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setSubmitError(result.error ?? "Login failed.");
      return;
    }

    window.location.assign(nextPath || `/${adminRoute}`);
  });

  return (
    <Card className="w-full max-w-md p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Hidden admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
          Operational sign-in
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
          Email and password only. Keep this surface separate from public acquisition.
        </p>
      </div>
      <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
        <Input label="Email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          error={errors.password?.message}
          type="password"
          {...register("password")}
        />
        {submitError ? (
          <div className="rounded-[18px] border border-[color:rgba(216,76,76,0.24)] bg-[color:rgba(216,76,76,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
            {submitError}
          </div>
        ) : null}
        <Button kind="admin" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type UserActionInput,
  userActionSchema,
} from "@/lib/validation/admin-actions";

type UserActionFormProps = {
  userId: string;
};

export function UserActionForm({ userId }: UserActionFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<UserActionInput>({
    resolver: zodResolver(userActionSchema),
    defaultValues: {
      action: "suspend",
      reason: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitMessage("");

    const response = await fetch("/api/admin/user-actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, userId }),
    });

    const result = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setSubmitError(result.error ?? "User action failed.");
      return;
    }

    setSubmitMessage(result.message ?? "User action accepted.");
    reset({
      action: values.action,
      reason: "",
    });
    router.refresh();
  });

  return (
    <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
        <span className="font-medium">Account action</span>
        <select
          {...register("action")}
          className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="suspend">Suspend</option>
          <option value="close">Close</option>
          <option value="reopen">Reopen</option>
        </select>
      </label>
      <Input
        label="Reason"
        error={errors.reason?.message}
        placeholder="Add the operational reason"
        {...register("reason")}
      />
      {submitError ? (
        <div className="rounded-[18px] border border-[color:rgba(216,76,76,0.24)] bg-[color:rgba(216,76,76,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {submitError}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          {submitMessage
            ? submitMessage
            : isSubmitSuccessful
              ? "Account action accepted."
              : "Account state changes should always carry an explicit note."}
        </p>
        <Button kind="admin" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Apply action"}
        </Button>
      </div>
    </form>
  );
}

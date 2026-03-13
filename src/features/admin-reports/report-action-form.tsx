"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ReportActionInput,
  reportActionSchema,
} from "@/lib/validation/admin-actions";

export function ReportActionForm() {
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<ReportActionInput>({
    resolver: zodResolver(reportActionSchema),
    defaultValues: {
      action: "resolve",
      reason: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  return (
    <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
        <span className="font-medium">Decision</span>
        <select
          {...register("action")}
          className="h-12 rounded-[16px] border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="resolve">Resolve</option>
          <option value="dismiss">Dismiss</option>
          <option value="escalate">Escalate</option>
        </select>
      </label>
      <Input
        label="Reason"
        error={errors.reason?.message}
        placeholder="Summarize why this action is appropriate"
        {...register("reason")}
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          {isSubmitSuccessful
            ? "Validation passed. Wire this to the moderation mutation next."
            : "Keep moderation actions explicit and reversible where possible."}
        </p>
        <Button kind="admin" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Confirm"}
        </Button>
      </div>
    </form>
  );
}

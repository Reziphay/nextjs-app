"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type UserActionInput,
  userActionSchema,
} from "@/lib/validation/admin-actions";

export function UserActionForm() {
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<UserActionInput>({
    resolver: zodResolver(userActionSchema),
    defaultValues: {
      action: "suspend",
      reason: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
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
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          {isSubmitSuccessful
            ? "Validation passed. Connect to account action endpoints next."
            : "Account state changes should always carry an explicit note."}
        </p>
        <Button kind="admin" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Apply action"}
        </Button>
      </div>
    </form>
  );
}

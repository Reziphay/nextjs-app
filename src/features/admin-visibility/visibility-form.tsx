"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type VisibilityLabelInput,
  visibilityLabelSchema,
} from "@/lib/validation/visibility";

export function VisibilityForm() {
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<VisibilityLabelInput>({
    resolver: zodResolver(visibilityLabelSchema),
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  return (
    <Card>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input label="Label name" error={errors.label?.message} {...register("label")} />
        <Input label="Target ID" error={errors.targetId?.message} {...register("targetId")} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Starts at"
            type="date"
            error={errors.startsAt?.message}
            {...register("startsAt")}
          />
          <Input
            label="Ends at"
            type="date"
            error={errors.endsAt?.message}
            {...register("endsAt")}
          />
        </div>
        <Input label="Operator note" error={errors.note?.message} {...register("note")} />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-ink-muted)]">
            {isSubmitSuccessful
              ? "Validation passed. Wire the mutation to backend admin routes next."
              : "Assignments stay explicit, scheduled, and auditable."}
          </p>
          <Button type="submit" kind="admin" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create assignment"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

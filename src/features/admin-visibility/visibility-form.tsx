"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type VisibilityLabelInput,
  visibilityLabelSchema,
} from "@/lib/validation/visibility";

type VisibilityFormProps = {
  title?: string;
  description?: string;
  initialValues?: Partial<VisibilityLabelInput>;
  lockedTargetId?: string;
};

export function VisibilityForm({
  description,
  initialValues,
  lockedTargetId,
  title,
}: VisibilityFormProps = {}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<VisibilityLabelInput>({
    resolver: zodResolver(visibilityLabelSchema),
    defaultValues: {
      label: initialValues?.label ?? "",
      targetId: lockedTargetId ?? initialValues?.targetId ?? "",
      startsAt: initialValues?.startsAt ?? "",
      endsAt: initialValues?.endsAt ?? "",
      note: initialValues?.note ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitMessage("");

    const response = await fetch("/api/admin/visibility-labels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setSubmitError(result.error ?? "Visibility assignment failed.");
      return;
    }

    setSubmitMessage(result.message ?? "Visibility assignment accepted.");
    reset();
    router.refresh();
  });

  return (
    <Card>
      {title ? (
        <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-muted)]">
          {description}
        </p>
      ) : null}
      {lockedTargetId ? (
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Target: <span className="font-medium text-[var(--color-ink)]">{lockedTargetId}</span>
        </p>
      ) : null}
      <form
        className={`grid gap-4${title || description || lockedTargetId ? " mt-6" : ""}`}
        onSubmit={onSubmit}
      >
        <Input label="Label name" error={errors.label?.message} {...register("label")} />
        <Input
          label="Target ID"
          error={errors.targetId?.message}
          readOnly={Boolean(lockedTargetId)}
          className={lockedTargetId ? "bg-[var(--color-surface)] text-[var(--color-ink-muted)]" : undefined}
          {...register("targetId")}
        />
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
                ? "Visibility assignment accepted."
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

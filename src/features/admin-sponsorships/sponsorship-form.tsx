"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type SponsorshipInput,
  sponsorshipSchema,
} from "@/lib/validation/sponsorship";

type SponsorshipFormProps = {
  title?: string;
  description?: string;
  initialValues?: Partial<SponsorshipInput>;
  lockedTargetId?: string;
  lockedTargetType?: SponsorshipInput["targetType"];
};

export function SponsorshipForm({
  description,
  initialValues,
  lockedTargetId,
  lockedTargetType,
  title,
}: SponsorshipFormProps = {}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<SponsorshipInput>({
    resolver: zodResolver(sponsorshipSchema),
    defaultValues: {
      campaignName: initialValues?.campaignName ?? "",
      targetType: lockedTargetType ?? initialValues?.targetType ?? "service",
      targetId: lockedTargetId ?? initialValues?.targetId ?? "",
      startsAt: initialValues?.startsAt ?? "",
      endsAt: initialValues?.endsAt ?? "",
      note: initialValues?.note ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitMessage("");

    const response = await fetch("/api/admin/sponsorships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setSubmitError(result.error ?? "Campaign creation failed.");
      return;
    }

    setSubmitMessage(result.message ?? "Campaign created.");
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
        <Input
          label="Campaign name"
          error={errors.campaignName?.message}
          {...register("campaignName")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {lockedTargetType ? (
            <div className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
              <span className="font-medium">Target type</span>
              <input type="hidden" {...register("targetType")} />
              <div className="flex h-12 items-center rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm capitalize text-[var(--color-ink-muted)]">
                {lockedTargetType}
              </div>
            </div>
          ) : (
            <label className="flex flex-col gap-2 text-sm text-[var(--color-ink)]">
              <span className="font-medium">Target type</span>
              <select
                {...register("targetType")}
                className="h-12 rounded-[16px] border border-transparent bg-[var(--color-surface)] px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                defaultValue="service"
              >
                <option value="service">Service</option>
                <option value="brand">Brand</option>
              </select>
              {errors.targetType?.message ? (
                <span className="text-xs text-[var(--color-error)]">
                  {errors.targetType.message}
                </span>
              ) : null}
            </label>
          )}
          <Input
            label="Target ID"
            error={errors.targetId?.message}
            readOnly={Boolean(lockedTargetId)}
            className={lockedTargetId ? "bg-[var(--color-surface)] text-[var(--color-ink-muted)]" : undefined}
            {...register("targetId")}
          />
        </div>
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
                ? "Campaign accepted."
                : "Sponsored placements remain separate from consumer payments."}
          </p>
          <Button type="submit" kind="admin" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create campaign"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

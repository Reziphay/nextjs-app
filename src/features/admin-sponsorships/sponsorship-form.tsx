"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type SponsorshipInput,
  sponsorshipSchema,
} from "@/lib/validation/sponsorship";

export function SponsorshipForm() {
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<SponsorshipInput>({
    resolver: zodResolver(sponsorshipSchema),
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });

  return (
    <Card>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          label="Campaign name"
          error={errors.campaignName?.message}
          {...register("campaignName")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Target type"
            error={errors.targetType?.message}
            placeholder="service or brand"
            {...register("targetType")}
          />
          <Input label="Target ID" error={errors.targetId?.message} {...register("targetId")} />
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
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-ink-muted)]">
            {isSubmitSuccessful
              ? "Validation passed. Add the campaign mutation after backend admin endpoints land."
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

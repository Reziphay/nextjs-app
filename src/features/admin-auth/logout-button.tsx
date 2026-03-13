"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  redirectTo: string;
};

export function LogoutButton({ redirectTo }: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      kind="ghost"
      disabled={isSubmitting}
      onClick={async () => {
        setIsSubmitting(true);
        await fetch("/api/admin/logout", {
          method: "POST",
        });
        window.location.assign(redirectTo);
      }}
    >
      {isSubmitting ? "Leaving..." : "Logout"}
    </Button>
  );
}

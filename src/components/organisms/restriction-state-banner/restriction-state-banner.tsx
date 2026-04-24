"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertTitle,
  Button,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import { useAppSelector } from "@/store/hooks";
import { selectRestrictionState } from "@/store/auth";
import styles from "./restriction-state-banner.module.css";

export function RestrictionStateBanner() {
  const { locale } = useLocale();
  const restrictionState = useAppSelector(selectRestrictionState);
  const copy = getAuthFlowMessages(locale).restriction;
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!restrictionState?.is_restricted) {
    return null;
  }

  return (
    <>
      <div className={styles.banner}>
        <Alert variant="warning" icon="warning">
          <AlertTitle>{copy.bannerTitle}</AlertTitle>
          <AlertDescription>{copy.bannerDescription}</AlertDescription>
        </Alert>

        <div className={styles.actions}>
          <Button
            variant="outline"
            type="button"
            onClick={() => setDetailsOpen(true)}
          >
            {copy.details}
          </Button>
          <Link className={styles.linkAction} href="/settings">
            {copy.goToSettings}
          </Link>
        </div>
      </div>

      <AlertDialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.modalTitle}</AlertDialogTitle>
          </AlertDialogHeader>

          <div className={styles.list}>
            <strong>{copy.missingVerificationTitle}</strong>
            <ul className={styles.list}>
              {restrictionState.missing_verifications.map((entry) => (
                <li key={entry}>
                  {entry === "email" ? copy.missingEmail : copy.missingPhone}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.list}>
            <strong>{copy.blockedActionsTitle}</strong>
            <ul className={styles.list}>
              {restrictionState.blocked_actions.map((action) => (
                <li key={action}>{copy.blockedActions[action] ?? action}</li>
              ))}
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Link
              className={styles.linkAction}
              href="/settings"
              onClick={() => setDetailsOpen(false)}
            >
              {copy.goToSettings}
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

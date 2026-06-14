"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import { fetchMyDayOffs, setMyDayOffs } from "@/lib/reservations-api";
import styles from "./availability-modal.module.css";

type Props = {
  open: boolean;
  accessToken: string;
  onClose: () => void;
};

// Day-off (vacation) manager. Working hours are configured per-service in the
// service form; this modal only blocks whole days across all the USO's services.
export function AvailabilityModal({ open, accessToken, onClose }: Props) {
  const { messages } = useLocale();
  const t = messages.calendar;

  const [dayoffs, setDayoffs] = useState<string[]>([]);
  const [newDayoff, setNewDayoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchMyDayOffs(accessToken)
      .then((list) => {
        if (!cancelled) setDayoffs(list.map((d) => d.date.slice(0, 10)).sort());
      })
      .catch(() => {
        if (!cancelled) setError(t.availabilitySaveError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, accessToken, t.availabilitySaveError]);

  const addDayoff = useCallback(() => {
    if (!newDayoff) return;
    setDayoffs((prev) => (prev.includes(newDayoff) ? prev : [...prev, newDayoff].sort()));
    setNewDayoff("");
  }, [newDayoff]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await setMyDayOffs(dayoffs, accessToken);
      onClose();
    } catch {
      setError(t.availabilitySaveError);
    } finally {
      setSaving(false);
    }
  }, [dayoffs, accessToken, onClose, t.availabilitySaveError]);

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t.dayOffsTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.dayOffsHint}</AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <p className={styles.hint}>…</p>
        ) : (
          <div className={styles.dayoffs}>
            <div className={styles.dayoffAdd}>
              <input
                type="date"
                className={styles.timeInput}
                value={newDayoff}
                onChange={(e) => setNewDayoff(e.target.value)}
              />
              <Button variant="outline" size="small" icon="add" onClick={addDayoff} disabled={!newDayoff}>
                {t.dayOffsTitle}
              </Button>
            </div>
            {dayoffs.length > 0 && (
              <ul className={styles.dayoffList}>
                {dayoffs.map((d) => (
                  <li key={d} className={styles.dayoffItem}>
                    <span>{d}</span>
                    <Button
                      variant="unstyled"
                      className={styles.dayoffRemove}
                      onClick={() => setDayoffs((prev) => prev.filter((x) => x !== d))}
                      aria-label="remove"
                    >
                      <Icon icon="close" size={14} color="current" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <AlertDialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {messages.reservations.cancel}
          </Button>
          <Button variant="primary" icon="save" onClick={handleSave} isLoading={saving} disabled={loading}>
            {t.availabilitySave}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

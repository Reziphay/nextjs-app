import { Badge } from "@/components/atoms";
import styles from "./coming-soon-panel.module.css";

type ComingSoonPanelProps = {
  title: string;
  badge: string;
  description: string;
};

export function ComingSoonPanel({
  title,
  badge,
  description,
}: ComingSoonPanelProps) {
  return (
    <section className={styles.panel}>
      <Badge variant="secondary">{badge}</Badge>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

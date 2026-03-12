import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(198,93,26,0.22),transparent_28%),linear-gradient(180deg,#1f1a17_0%,#120f0d_100%)] text-white">
      <div className="container-shell py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          Internal route foundation
        </p>
      </div>
      <main id="main-content">{children}</main>
    </div>
  );
}


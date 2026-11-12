import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="text-heading">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

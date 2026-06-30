import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="editorial-heading text-4xl leading-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

import { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="max-w-2xl text-base text-slate-600">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

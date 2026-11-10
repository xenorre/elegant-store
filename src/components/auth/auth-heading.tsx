import type { ReactNode } from "react";

type AuthHeadingProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

export function AuthHeading({ eyebrow, title, children }: AuthHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-3">
      <p className="eyebrow text-muted">{eyebrow}</p>
      <h1 className="text-heading">{title}</h1>
      {children && <p className="text-body-lg text-muted">{children}</p>}
    </div>
  );
}

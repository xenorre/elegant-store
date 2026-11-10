import type { ReactNode } from "react";

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="border-l border-danger pl-4 text-body-sm text-danger">
      {children}
    </div>
  );
}

export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="border-l border-success pl-4 text-body-sm text-success">
      {children}
    </div>
  );
}

import type { ComponentProps } from "react";

// Data tables for admin lists: hairline rows, eyebrow headers, tabular figures.
// Scrolls sideways on narrow screens instead of squeezing columns.

export function Table({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="-mx-gutter overflow-x-auto px-gutter">
      <table className="w-full min-w-[44rem] border-collapse text-left text-body-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({ className = "", ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={`eyebrow border-b border-line py-3 pr-4 align-bottom font-normal text-muted last:pr-0 ${className}`}
      {...props}
    />
  );
}

export function Td({ className = "", ...props }: ComponentProps<"td">) {
  return (
    <td className={`border-b border-line py-4 pr-4 align-middle last:pr-0 ${className}`} {...props} />
  );
}

export function TableSkeleton({ rows = 8, label }: { rows?: number; label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex animate-pulse flex-col">
      <div className="h-10 border-b border-line" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-6 border-b border-line py-4">
          <div className="h-4 w-1/4 bg-surface" />
          <div className="h-4 w-1/3 bg-surface" />
          <div className="ml-auto h-4 w-16 bg-surface" />
        </div>
      ))}
    </div>
  );
}

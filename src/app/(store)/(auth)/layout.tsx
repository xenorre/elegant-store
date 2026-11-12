import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="section flex-1">
      <div className="mx-auto w-full max-w-form px-gutter">{children}</div>
    </main>
  );
}

import Link from "next/link";

const columns = [
  {
    title: "Client Services",
    links: [
      { name: "Contact us", href: "/client-services" },
      { name: "Delivery", href: "/client-services/delivery" },
      { name: "Returns & exchanges", href: "/client-services/returns" },
      { name: "Book an appointment", href: "/client-services/appointments" },
    ],
  },
  {
    title: "The House",
    links: [
      { name: "Our story", href: "/the-house" },
      { name: "Craftsmanship", href: "/the-house/craftsmanship" },
      { name: "Sustainability", href: "/the-house/sustainability" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms & conditions", href: "/legal/terms" },
      { name: "Privacy policy", href: "/legal/privacy" },
      { name: "Cookie settings", href: "/legal/cookies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-wide grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-display text-title font-semibold tracking-wide uppercase">
            Elegant Store
          </Link>
          <p className="max-w-xs text-body-sm text-muted">
            Ready-to-wear, leather goods and fine jewellery, made in small
            ateliers and designed to be kept.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="eyebrow">{column.title}</h2>
            <ul className="mt-5 flex flex-col gap-3 text-body-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-muted">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-wide flex flex-col gap-2 border-t border-line py-6 text-micro text-muted sm:flex-row sm:justify-between">
        <p>© 2026 Elegant. All rights reserved.</p>
        <p>Imagery courtesy of Unsplash photographers.</p>
      </div>
    </footer>
  );
}

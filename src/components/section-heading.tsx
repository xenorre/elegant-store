import Link from "next/link";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  href?: string;
  cta?: string;
};

export function SectionHeading({ eyebrow, title, href, cta }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h2 className="text-heading">{title}</h2>
      </div>
      {href && cta && (
        <Link href={href} className="eyebrow link-reveal self-start sm:self-auto">
          {cta}
        </Link>
      )}
    </div>
  );
}

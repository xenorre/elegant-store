import Link from "next/link";

type FilterChipsProps = {
  label: string;
  options: { name: string; href: string; current: boolean }[];
};

// Same chips as the department category filter.
export function FilterChips({ label, options }: FilterChipsProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              scroll={false}
              aria-current={option.current ? "page" : undefined}
              className={`btn btn-sm ${option.current ? "btn-primary" : "btn-secondary [--btn-border:var(--line)]"}`}
            >
              {option.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

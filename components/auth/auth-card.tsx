import { Link } from "@/i18n/navigation";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: { prompt: string; href: string; label: string };
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)]">
      <div aria-hidden="true" className="h-1 bg-gold" />
      <div className="p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1.5 mb-8 text-sm text-muted-foreground">
          {description}
        </p>
        {children}
        {footer && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {footer.prompt}{" "}
            <Link
              href={footer.href}
              className="font-semibold text-teal underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {footer.label}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

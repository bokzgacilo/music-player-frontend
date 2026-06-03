export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

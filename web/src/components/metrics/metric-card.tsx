export const MetricCard = ({
  label,
  value,
  detail,
  featured = false,
}: {
  label: string;
  value: string;
  detail: string;
  featured?: boolean;
}) => (
  <section
    className={`rounded-2xl p-5 shadow-sm ring-1 ring-black/10 ${featured ? "bg-[linear-gradient(to_bottom,var(--acet-tertiary),var(--acet-primary))] text-white shadow-md" : "bg-card"}`}
  >
    <p
      className={`${featured ? "text-white/80" : "text-muted-foreground"} text-sm leading-5`}
    >
      {label}
    </p>
    <p
      className={`${featured ? "text-white" : "text-foreground"} mt-2 text-3xl font-bold tracking-tight`}
    >
      {value}
    </p>
    <p
      className={`${featured ? "text-white/80" : "text-muted-foreground"} mt-2 text-sm`}
    >
      {detail}
    </p>
  </section>
);

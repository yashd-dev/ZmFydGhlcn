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
    className={`rounded-lg border p-4 ${featured ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
  >
    <p
      className={`${featured ? "text-primary-foreground" : "text-muted-foreground"} text-xs tracking-wider uppercase`}
    >
      {label}
    </p>
    <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    <p
      className={`${featured ? "text-primary-foreground/80" : "text-muted-foreground"} mt-2 text-xs`}
    >
      {detail}
    </p>
  </section>
);

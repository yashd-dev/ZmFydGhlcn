export const MetricCard = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) => (
  <section className="bg-card border p-4">
    <p className="text-muted-foreground text-xs tracking-wider uppercase">
      {label}
    </p>
    <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    <p className="text-muted-foreground mt-2 text-xs">{detail}</p>
  </section>
);

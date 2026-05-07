interface SummaryCardProps {
  title: string;
  value: number | string;
  description: string;
}

export default function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="p-6 bg-card rounded-xl shadow-card hover:shadow-lg transition-all border border-border">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-4xl font-bold mt-2 text-foreground">{value || 0}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

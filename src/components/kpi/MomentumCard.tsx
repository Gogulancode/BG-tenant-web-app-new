export default function MomentumCard({ value }: { value: number }) {
  return (
    <div className="p-6 bg-gradient-to-br from-primary to-primary-dark text-primary-foreground rounded-xl shadow-card hover:shadow-lg transition-all">
      <h3 className="text-lg font-medium opacity-90">Momentum</h3>
      <p className="text-4xl font-bold mt-2">{value || 0}</p>
      <p className="text-sm opacity-80 mt-1">Your weekly consistency score</p>
    </div>
  );
}

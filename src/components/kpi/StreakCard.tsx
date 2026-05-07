import { Flame } from "lucide-react";

export default function StreakCard({ value }: { value: number }) {
  return (
    <div className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-card hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-2">
        <Flame className="h-6 w-6" />
        <h3 className="text-lg font-medium">Streak</h3>
      </div>
      <p className="text-4xl font-bold">{value || 0} days</p>
      <p className="text-sm opacity-80 mt-1">Keep the momentum going!</p>
    </div>
  );
}

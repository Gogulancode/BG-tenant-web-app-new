import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import type { CoachCatchUpPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CoachCatchUpCard({
  isSaving,
  onSave,
}: {
  isSaving?: boolean;
  onSave: (payload: CoachCatchUpPayload) => void;
}) {
  const [salesRevenue, setSalesRevenue] = useState("");
  const [orderCount, setOrderCount] = useState("");
  const [activityCount, setActivityCount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const count = Math.max(0, Number(activityCount || 0));
    const occurredOn = todayInputValue();

    onSave({
      salesRevenue: salesRevenue ? Number(salesRevenue) : undefined,
      orderCount: orderCount ? Number(orderCount) : undefined,
      activitiesCompleted: Array.from({ length: count }, (_, index) => ({
        title:
          count === 1 ? "Catch-up activity" : `Catch-up activity ${index + 1}`,
        category: "Sales",
        occurredOn,
      })),
      notes: notes || undefined,
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Catch up this week first
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Add what already happened from Monday to today. This updates the real
          weekly records so the coach can calculate what is left.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            inputMode="numeric"
            placeholder="Sales closed"
            value={salesRevenue}
            onChange={(event) => setSalesRevenue(event.target.value)}
          />
          <Input
            inputMode="numeric"
            placeholder="Orders/deals"
            value={orderCount}
            onChange={(event) => setOrderCount(event.target.value)}
          />
          <Input
            inputMode="numeric"
            placeholder="Activities done"
            value={activityCount}
            onChange={(event) => setActivityCount(event.target.value)}
          />
        </div>
        <Textarea
          placeholder="Any useful notes for this week?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save catch-up
        </Button>
      </CardContent>
    </Card>
  );
}

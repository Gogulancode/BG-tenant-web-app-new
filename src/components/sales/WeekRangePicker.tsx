import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clamp } from "@/lib/utils";

export type WeekRangeOption = "last6" | "last4" | "last12" | "custom";

interface WeekRangePickerProps {
  rangeOption: WeekRangeOption;
  onRangeOptionChange: (option: WeekRangeOption) => void;
  customFromWeek: number;
  customToWeek: number;
  onCustomFromWeekChange: (week: number) => void;
  onCustomToWeekChange: (week: number) => void;
  className?: string;
}

const RANGE_OPTIONS: { value: WeekRangeOption; label: string }[] = [
  { value: "last6", label: "Last 6 weeks" },
  { value: "last4", label: "Last 4 weeks" },
  { value: "last12", label: "Last 12 weeks" },
  { value: "custom", label: "Custom range" },
];

export function WeekRangePicker({
  rangeOption,
  onRangeOptionChange,
  customFromWeek,
  customToWeek,
  onCustomFromWeekChange,
  onCustomToWeekChange,
  className,
}: WeekRangePickerProps) {
  const handleFromWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onCustomFromWeekChange(clamp(value, 1, 52));
    }
  };

  const handleToWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onCustomToWeekChange(clamp(value, 1, 52));
    }
  };

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Range</Label>
        <Select
          value={rangeOption}
          onValueChange={(v) => onRangeOptionChange(v as WeekRangeOption)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rangeOption === "custom" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From Week</Label>
            <Input
              type="number"
              min={1}
              max={52}
              value={customFromWeek}
              onChange={handleFromWeekChange}
              className="w-[80px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To Week</Label>
            <Input
              type="number"
              min={1}
              max={52}
              value={customToWeek}
              onChange={handleToWeekChange}
              className="w-[80px]"
            />
          </div>
        </>
      )}
    </div>
  );
}

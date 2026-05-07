import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyINR, formatPercent } from "@/lib/utils";
import type { WeeklySalesSummaryItem } from "@/lib/api";

interface WeeklySummaryTableProps {
  items: WeeklySalesSummaryItem[];
  className?: string;
}

/**
 * Get achievement color based on percentage thresholds
 */
function getAchievementColor(percent: number): string {
  if (percent >= 100) return "text-emerald-600";
  if (percent >= 75) return "text-blue-600";
  if (percent >= 50) return "text-amber-600";
  return "text-red-600";
}

/**
 * Get readable text color for a background color
 */
function getContrastTextColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function WeeklySummaryTableComponent({ items, className }: WeeklySummaryTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No weekly data available
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Week</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Achieved</TableHead>
            <TableHead className="text-right w-[80px]">%</TableHead>
            <TableHead className="w-[120px]">Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.week}>
              <TableCell className="font-medium">W{item.week}</TableCell>
              <TableCell className="text-right">
                {formatCurrencyINR(item.target)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrencyINR(item.achieved)}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${getAchievementColor(
                  item.achievementPercent
                )}`}
              >
                {formatPercent(item.achievementPercent, 1)}
              </TableCell>
              <TableCell>
                {item.stage ? (
                  <Badge
                    variant="secondary"
                    style={
                      item.stage.color
                        ? {
                            backgroundColor: item.stage.color,
                            color: getContrastTextColor(item.stage.color),
                          }
                        : undefined
                    }
                  >
                    {item.stage.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const WeeklySummaryTable = React.memo(WeeklySummaryTableComponent);

import type { WeeklySalesSummaryItem } from "@/lib/api";

/**
 * Export weekly sales summary data to CSV file
 */
export function exportWeeklySummaryToCSV(
  items: WeeklySalesSummaryItem[],
  year: number,
  filename?: string
): void {
  if (items.length === 0) {
    console.warn("No data to export");
    return;
  }

  // CSV headers
  const headers = ["Year", "Week", "Target", "Achieved", "Achievement %", "Stage"];

  // Build rows
  const rows = items.map((item) => [
    year.toString(),
    item.week.toString(),
    item.target.toFixed(2),
    item.achieved.toFixed(2),
    item.achievementPercent.toFixed(2),
    item.stage?.name ?? "",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape cells that contain commas or quotes
          if (cell.includes(",") || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `sales-weekly-summary-${year}-w${items[0]?.week ?? 1}-w${
    items[items.length - 1]?.week ?? 52
  }.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? defaultFilename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

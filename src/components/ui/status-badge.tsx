import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "PENDING" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "OVERDUE"
  | "OPEN"
  | "CLOSED"
  | "WON"
  | "LOST"
  | "MISSED"
  | "PLANNED"
  | "DONE";

const statusConfig: Record<StatusType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
  COMPLETED: { label: "Completed", variant: "default", className: "bg-green-500 hover:bg-green-600" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  OPEN: { label: "Open", variant: "secondary" },
  CLOSED: { label: "Closed", variant: "outline" },
  WON: { label: "Won", variant: "default", className: "bg-green-500 hover:bg-green-600" },
  LOST: { label: "Lost", variant: "destructive" },
  MISSED: { label: "Missed", variant: "destructive", className: "bg-amber-500 hover:bg-amber-600" },
  PLANNED: { label: "Planned", variant: "secondary" },
  DONE: { label: "Done", variant: "default", className: "bg-green-500 hover:bg-green-600" },
};

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().replace(/ /g, "_") as StatusType;
  const config = statusConfig[normalizedStatus] || { 
    label: status, 
    variant: "outline" as const 
  };

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

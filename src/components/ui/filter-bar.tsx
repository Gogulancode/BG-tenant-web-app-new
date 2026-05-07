import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  dateFilters?: {
    from: string;
    to: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
  };
  onClear?: () => void;
  onApply?: () => void;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  dateFilters,
  onClear,
  onApply,
  className,
}: FilterBarProps) {
  const hasActiveFilters = 
    searchValue || 
    filters?.some(f => f.value) || 
    dateFilters?.from || 
    dateFilters?.to;

  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 bg-muted/50 rounded-lg border",
      className
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}

        {filters?.map((filter) => (
          <Select
            key={filter.key}
            value={filter.value}
            onValueChange={filter.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {dateFilters && (
          <>
            <Input
              type="date"
              value={dateFilters.from}
              onChange={(e) => dateFilters.onFromChange(e.target.value)}
              placeholder="From date"
            />
            <Input
              type="date"
              value={dateFilters.to}
              onChange={(e) => dateFilters.onToChange(e.target.value)}
              placeholder="To date"
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onApply && (
          <Button onClick={onApply} size="sm">
            Apply Filters
          </Button>
        )}
        {onClear && hasActiveFilters && (
          <Button onClick={onClear} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

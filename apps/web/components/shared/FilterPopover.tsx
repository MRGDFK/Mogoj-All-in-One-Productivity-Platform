"use client";

import type { LucideIcon } from "lucide-react";
import { ListFilter, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";

export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  operatorLabel?: string;
  placeholder: string;
  valueOptions: FilterFieldOption[];
}

export type FilterState = Record<string, string | undefined>;

interface FilterPopoverProps {
  fields: FilterFieldConfig[];
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function FilterPopover({ fields, value, onChange }: FilterPopoverProps) {
  function setField(key: string, fieldValue: string) {
    onChange({ ...value, [key]: fieldValue === "any" ? undefined : fieldValue });
  }

  function clearFilters() {
    onChange({});
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Filter">
          <ListFilter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={16} className="w-[520px] max-w-[calc(100vw-32px)] p-3">
        <div className="space-y-2">
          {fields.map((field, index) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-sm text-muted-foreground">
                  {index === 0 ? "Where" : "And"}
                </span>
                <div className="flex h-9 w-32 shrink-0 items-center gap-1.5 rounded-lg border border-input px-2 text-sm">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{field.label}</span>
                </div>
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                  {field.operatorLabel ?? "Is"}
                </span>
                <Select value={value[field.key] ?? "any"} onValueChange={(v) => setField(field.key, v)}>
                  <SelectTrigger aria-label={`Filter by ${field.label}`} className="min-w-0 flex-1 whitespace-nowrap">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{field.placeholder}</SelectItem>
                    {field.valueOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear filters
        </button>
      </PopoverContent>
    </Popover>
  );
}

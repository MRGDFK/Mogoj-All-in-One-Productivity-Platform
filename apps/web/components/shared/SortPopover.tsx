"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/Popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/Select";

export interface SortFieldOption {
  label: string;
  value: string;
}

export type SortDirection = "asc" | "desc";

export interface SortValue {
  field: string;
  direction: SortDirection;
}

interface SortPopoverProps {
  fieldOptions: SortFieldOption[];
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export function SortPopover({ fieldOptions, value, onChange }: SortPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Sort">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto gap-2">
        <Select value={value.field} onValueChange={(field) => onChange({ ...value, field })}>
          <SelectTrigger aria-label="Sort by" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={value.direction}
          onValueChange={(direction) => onChange({ ...value, direction: direction as SortDirection })}
        >
          <SelectTrigger aria-label="Sort direction" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}

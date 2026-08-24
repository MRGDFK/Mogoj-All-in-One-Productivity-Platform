"use client";

import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used within <Tabs>");
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={cn("flex gap-1 border-b border-border", className)}>{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  badge?: number;
  className?: string;
}

export function TabsTrigger({ value, children, badge, className }: TabsTriggerProps) {
  const { value: activeValue, onChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onChange(value)}
      className={cn(
        "rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
        "data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
}

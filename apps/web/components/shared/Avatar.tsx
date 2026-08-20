"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary",
        className,
      )}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="aspect-square h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center text-xs font-medium">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

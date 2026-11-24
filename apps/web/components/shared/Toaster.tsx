"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "glass-overlay !bg-[rgb(24_27_34/0.76)] !text-card-foreground !border-border !rounded-xl",
        },
      }}
    />
  );
}

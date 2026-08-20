"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Loader } from "@/components/shared/Loader";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader label="Loading Mogoj…" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

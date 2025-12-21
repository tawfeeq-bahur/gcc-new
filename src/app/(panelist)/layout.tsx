"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";

export default function PanelistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

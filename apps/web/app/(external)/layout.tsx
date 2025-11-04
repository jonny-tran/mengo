import React from "react";
import { Header } from "@/components/layout/header";

export default function ExternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      {/* Footer sẽ được thêm sau */}
    </div>
  );
}

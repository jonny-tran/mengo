import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Add Sidebar component here */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

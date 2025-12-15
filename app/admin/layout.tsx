import React from "react";
import AdminAuthGate, { LogoutButton } from "@/components/AdminAuthGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <header className="site-header">
        <div className="container" style={{ justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Admin</div>
          <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/admin/deals">Deals</a>
            <a href="/">View Site</a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="container">{children}</div>
    </AdminAuthGate>
  );
}

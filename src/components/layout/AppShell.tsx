import React from "react";
import Sidebar from "./Sidebar";
import "./AppShell.css";

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <main className="app-main">
      {children}
    </main>
  </div>
);

export { AppShell };
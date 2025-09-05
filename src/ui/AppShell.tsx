import React from "react";
import { Box, Card } from "@dhis2/ui";
import { Sidebar } from "./Sidebar";
import "./AppShell.css";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-shell">
      <aside className="sidebar-wrapper">
        <Card>
          <Sidebar />
        </Card>
      </aside>
      <main className="app-main">
        <Box padding="16">
          {children}
        </Box>
      </main>
    </div>
  );
};
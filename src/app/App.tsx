import React from "react";
import { AppShell } from "../components/layout/AppShell";
import { Router } from "./Router";

export const App: React.FC = () => (
  <AppShell>
    <Router />
  </AppShell>
);
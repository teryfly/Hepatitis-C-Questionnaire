import React from "react";
import { HeaderBar } from "@dhis2/ui";
import { AppShell } from "../ui/AppShell";
import { Router } from "./Router";

export const App: React.FC = () => {
  return (
    <div>
      <HeaderBar appName="Hepatitis-C-Questionnaire" />
      <AppShell>
        <Router />
      </AppShell>
    </div>
  );
};
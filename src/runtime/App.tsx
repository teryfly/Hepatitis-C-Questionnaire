import React from "react";
import { HeaderBar, Layer, Box, NoticeBox } from "@dhis2/ui";
import { AppShell } from "../ui/AppShell";
import { Router } from "./Router";

export const App: React.FC = () => {
  return (
    <Layer level={0} transparent>
      <HeaderBar appName="Hepatitis-C-Questionnaire" />
      <AppShell>
        <Router />
      </AppShell>
    </Layer>
  );
};
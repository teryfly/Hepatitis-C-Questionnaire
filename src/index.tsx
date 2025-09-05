import React from "react";
import { createRoot } from "react-dom/client";
import { Provider as AppRuntimeProvider } from "@dhis2/app-runtime";
import { CssVariables, HeaderBar } from "@dhis2/ui";
import { BrowserRouter } from "react-router-dom";
import { App } from "./runtime/App";
import "./styles/global.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

const appConfig = {
  baseUrl: process.env.DHIS2_BASE_URL || "..",
  apiVersion: 41
};

root.render(
  <React.StrictMode>
    <CssVariables spacers colors theme />
    <AppRuntimeProvider config={appConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppRuntimeProvider>
  </React.StrictMode>
);
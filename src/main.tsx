import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/AppProviders";
import { App } from "./app/App";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
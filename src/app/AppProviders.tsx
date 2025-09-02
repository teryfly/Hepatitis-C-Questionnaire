import React from "react";
import { QueryClientProvider } from "./QueryClientProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider>
      {children}
    </QueryClientProvider>
  );
};
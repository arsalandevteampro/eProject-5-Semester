import React from "react";
import AppRoutes from "./router/route";
import { SettingsProvider } from "./contexts/SettingsContext";
import { NotificationProvider } from "./contexts/NotificationContext";

export default function App() {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </SettingsProvider>
  );
}

"use client";

import { Provider } from "react-redux";
import { store, setup401Handler } from "@/store";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wire 401 → logout once at app startup
  if (typeof window !== "undefined") {
    setup401Handler();
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
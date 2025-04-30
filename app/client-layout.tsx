"use client";
import { I18nProvider } from "../components/i18n-provider";
import { Providers } from "./providers"; // Import the Providers component

export default function ClientLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Providers>
      {" "}
      {/* Wrap with Providers */}
      <I18nProvider>{children}</I18nProvider>
    </Providers>
  );
}

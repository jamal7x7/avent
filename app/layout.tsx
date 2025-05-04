import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
// Import Tajawal alongside Geist
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import { CartProvider } from "~/lib/hooks/use-cart";
import ClientLayout from "./client-layout";

import "./globals.css";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configure Tajawal font
const tajawal = Tajawal({
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700", "800"], // Specify weights used
  subsets: ["arabic", "latin"], // Include necessary subsets
  display: "swap", // Font display strategy
});

export const metadata: Metadata = {
  title: "Avent",
  description: "Avent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scheme-only-dark">
      <body
        // Add Tajawal variable alongside Geist
        className={`${tajawal.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <ClientLayout>{children}</ClientLayout>
            </div>
          </CartProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

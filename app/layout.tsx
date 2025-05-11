import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
// Import Tajawal alongside Geist
import { Inter, Tajawal } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { CartProvider } from "~/lib/hooks/use-cart";
import ClientLayout from "./client-layout";

import "./globals.css";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["arabic", "latin"],
  display: "swap",
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
      <head>
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
        {/* rest of your scripts go under */}
      </head>
      <body
        // Add Tajawal variable alongside Geist
        className={`${inter.variable} ${tajawal.variable} antialiased`}
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
            <Toaster />
          </CartProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

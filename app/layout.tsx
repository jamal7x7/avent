import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "~/lib/hooks/use-cart";
import { ThemeProvider } from "~/ui/components/theme-provider";
import { Providers } from "./providers";

import "~/css/globals.css";
import { Footer } from "~/ui/components/footer";
import { Header } from "~/ui/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avent ",
  description: "Avent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header showAuth={true} />
                {children}
                <Footer />
              </div>
            </CartProvider>
          </Providers>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

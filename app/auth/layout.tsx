"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next"; // Assuming i18n setup
import { AuthImageSection } from "~/components/auth/AuthImageSection"; // Import the new component
import { LanguageSwitcher } from "~/components/language-switcher"; // Import the switcher
// Removed unused imports: Image, redirect, auth

export default function AuthLayout({
  // Removed async as it's now a client component
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { t } = useTranslation(); // Initialize translation hook

  // Session check might need adjustment for client-side or be handled differently
  // For now, keeping the redirect logic but it might cause hydration issues.
  // Consider moving session check to a wrapper or middleware if issues arise.
  // const session = await auth.api.getSession({ headers: await headers() }); // Cannot use await/headers in client component
  // if (session) { redirect('/dashboard'); }

  const isSignIn = pathname === "/auth/sign-in";
  const isSignUp = pathname.startsWith("/auth/sign-up"); // Covers /sign-up and /sign-up/email

  return (
    <div className="relative grid min-h-screen w-screen md:grid-cols-1">
      {" "}
      {/* Add relative positioning */}
      {/* Language Switcher in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher isCollapsed={true} />{" "}
        {/* Use collapsed version for icon only */}
      </div>
      {/* Form Content Area */}
      <div className="flex items-center justify-center p-4 md:p-8">
        {children}
      </div>
      {/* Image Area (Now handled by AuthImageSection) */}
      {/* <AuthImageSection isSignIn={isSignIn} isSignUp={isSignUp} t={t} /> */}
    </div>
  );
}

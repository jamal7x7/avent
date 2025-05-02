"use client";

import type { TFunction } from "i18next";
import Image from "next/image";

interface AuthImageSectionProps {
  isSignIn: boolean;
  isSignUp: boolean;
  t: TFunction<"translation", undefined>;
}

export function AuthImageSection({
  isSignIn,
  isSignUp,
  t,
}: AuthImageSectionProps) {
  return (
    <>
      {isSignIn && (
        <div className="relative hidden md:block">
          <Image
            // src=" `https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3` "
            src="https://images.unsplash.com/photo-1604866830893-c13cafa515d5?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt={t("auth.signIn.appName")}
            fill
            priority
            sizes="(max-width: 768px) 0vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h1 className="text-3xl font-bold">{t("auth.signIn.appName")}</h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              {t("auth.signIn.appDescription")}
            </p>
          </div>
        </div>
      )}

      {isSignUp && (
        <div className="hidden items-center justify-center bg-muted md:flex">
          <Image
            src="/placeholder.svg" // Replace with your actual image if available
            alt={t("auth.signUp.appName")}
            width={500}
            height={500}
            className="dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      )}

      {/* Fallback or default image if needed when not sign-in/sign-up */}
      {!isSignIn && !isSignUp && (
        <div className="hidden items-center justify-center bg-muted md:flex">
          {/* Default placeholder or image */}
        </div>
      )}
    </>
  );
}

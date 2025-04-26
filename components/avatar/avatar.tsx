"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "~/lib/utils";

// i18n fallback text
const AVATAR_ALT = {
  en_us: "User avatar",
  fr_fr: "Avatar utilisateur",
  ar_ma: "الصورة الرمزية للمستخدم",
};

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  locale?: "en_us" | "fr_fr" | "ar_ma";
}

/**
 * Avatar component with fallback and error handling.
 * Uses Next.js Image for optimization and accessibility.
 */
export function Avatar({
  src,
  alt,
  size = 36,
  className,
  fallback,
  locale = "en_us",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const displayAlt = alt || AVATAR_ALT[locale] || AVATAR_ALT.en_us;

  // Show fallback if error, no src, or empty string
  if (!src || hasError) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-muted",
          className,
          `w-[${size}px] h-[${size}px]`,
        )}
        aria-label={displayAlt}
        role="img"
      >
        {fallback || <User className="w-1/2 h-1/2 text-muted-foreground" />}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={displayAlt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setHasError(true)}
      priority={false}
      loading="lazy"
      sizes={`${size}px`}
    />
  );
}

"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
// import {AnimatedCard} from "~/components/animated-card";

// Dynamically import the AnimatedCard component with ssr: false
const AnimatedCard = dynamic(
  () => import("~/components/animated-card").then((mod) => mod.default),
  {
    ssr: false,
  },
);
// const AnimatedCard = (await import("~/components/animated-card")).default;

interface AnimatedCardWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCardWrapper({
  children,
  className,
  delay,
}: AnimatedCardWrapperProps) {
  return (
    <AnimatedCard className={className} delay={delay}>
      {children}
    </AnimatedCard>
  );
}

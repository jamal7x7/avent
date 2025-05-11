"use client";

import { AnimatePresence, motion } from "framer-motion"; // Corrected import
import { type ReactNode, useEffect, useState } from "react";
import { Card } from "~/components/ui/card";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

const hoverVariants = {
  initial: {
    scale: 1,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.001,
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  withHoverEffect?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  withHoverEffect = true,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
            // variants={containerVariants}
          className={className}
          whileHover={withHoverEffect ? "hover" : undefined}
          variants={withHoverEffect ? hoverVariants : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add default export for dynamic import compatibility
export default AnimatedCard;

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  withPulse?: boolean;
}

export function AnimatedItem({
  children,
  className,
  delay = 0,
  withPulse = false,
}: AnimatedItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      animate={withPulse ? "pulse" : undefined}
      className={className}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}

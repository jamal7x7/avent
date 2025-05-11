"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface AnnouncementDetailActionsProps {
  allowQuestions: boolean;
}

export function AnnouncementDetailActions({
  allowQuestions,
}: AnnouncementDetailActionsProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleQuestionClick = () => {
    setIsClicked(true);

    // Scroll to the question form with smooth animation
    document
      .getElementById("question-form")
      ?.scrollIntoView({ behavior: "smooth" });

    // Reset the clicked state after animation completes
    setTimeout(() => setIsClicked(false), 1000);
  };

  if (!allowQuestions) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="outline"
        className={`h-9 transition-all duration-300 ${isClicked ? "bg-primary/10" : ""}`}
        onClick={handleQuestionClick}
      >
        <MessageCircle
          className={`mr-2 h-4 w-4 ${isClicked ? "text-primary animate-pulse" : ""}`}
        />
        Ask a Question
      </Button>
    </motion.div>
  );
}

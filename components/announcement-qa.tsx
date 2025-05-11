"use client";

import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion"; // Restored import
import { MessageCircle, Send, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";

// Interface for individual question data
interface QuestionData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  answers: AnswerData[];
}

interface AnswerData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

interface AnnouncementQAProps {
  announcementId: string;
  // Mock data for now, would be fetched from API in real implementation
  questions?: QuestionData[];
}

export function AnnouncementQA({
  announcementId,
  questions: initialQuestions = [],
}: AnnouncementQAProps) {
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [newAnswer, setNewAnswer] = useState("");
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock user data - would come from auth context in real implementation
  const currentUser = {
    id: "current-user",
    name: "Current User",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    role: "Teacher",
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const mockNewQuestion: QuestionData = {
        id: `q-${Date.now()}`,
        content: newQuestion,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        answers: [],
      };

      setQuestions([mockNewQuestion, ...questions]);
      setNewQuestion("");
    } catch (error) {
      console.error("Failed to submit question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!newAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const mockNewAnswer: AnswerData = {
        id: `a-${Date.now()}`,
        content: newAnswer,
        createdAt: new Date().toISOString(),
        user: currentUser,
      };

      setQuestions(
        questions.map((q) => {
          if (q.id === questionId) {
            return { ...q, answers: [...q.answers, mockNewAnswer] };
          }
          return q;
        }),
      );

      setNewAnswer("");
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleQuestionExpand = (questionId: string) => {
    if (!document.startViewTransition) {
      setExpandedQuestionId(
        expandedQuestionId === questionId ? null : questionId,
      );
      return;
    }

    document.startViewTransition(() => {
      setExpandedQuestionId(
        expandedQuestionId === questionId ? null : questionId,
      );
    });
  };

  useEffect(() => {
    if (expandedQuestionId && answerTextareaRef.current) {
      setTimeout(() => {
        answerTextareaRef.current?.focus();
      }, 100);
    }
  }, [expandedQuestionId]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Question input form */}
      <motion.div variants={itemVariants}>
        <Card
          id="question-form"
          className="shadow-sm  hover:shadow-md transition-all duration-300"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>
          </CardHeader>
          <form onSubmit={handleQuestionSubmit}>
            <CardContent className="pb-3">
              <Textarea
                placeholder="Ask a question about this announcement..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="resize-none focus-visible:ring-primary/20 transition-all duration-200"
                rows={3}
              />
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="submit"
                  disabled={!newQuestion.trim() || isSubmitting}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Question
                  {isSubmitting && <span className="animate-spin">⟳</span>}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* Questions list */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                variants={itemVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                layout
                whileHover={{ scale: 1, transition: { duration: 0.2 } }}
              >
                <Card className="shadow-sm hover:shadow-md  pb-2  transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <motion.div
                        className="flex items-center gap-3"
                        layout="position"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={question.user.avatar}
                            alt={question.user.name}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">
                            {question.user.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(question.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          <p className=" mt-2 text-sm whitespace-pre-wrap">
                            {question.content} 
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionExpand(question.id)}
                          className="text-xs"
                        >
                          {question.answers.length > 0
                            ? `${question.answers.length} ${
                                question.answers.length === 1
                                  ? "Answer"
                                  : "Answers"
                              }`
                            : "Answer"}
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {/* Answers section - only shown when expanded */}
                    {expandedQuestionId === question.id && (
                      <div // This div uses document.startViewTransition, not Framer Motion directly for enter/exit
                        className="px-6 pb-3 overflow-hidden"
                      >
                        <div className="border-t pt-3 space-y-4">
                          {question.answers.length > 0 ? (
                            <div className="space-y-4">
                              <AnimatePresence>
                                {question.answers.map((answer, answerIndex) => (
                                  <motion.div
                                    key={answer.id}
                                    className="flex gap-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * answerIndex }}
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={answer.user.avatar}
                                        alt={answer.user.name}
                                      />
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {answer.user.name}
                                        </span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                          {answer.user.role}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(
                                            new Date(answer.createdAt),
                                            { addSuffix: true }
                                          )}
                                        </span>
                                      </div>
                                      <p className="text-sm mt-1 whitespace-pre-wrap">
                                        {answer.content}
                                      </p>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No answers yet.
                            </p>
                          )}

                          {/* Answer input */}
                          <motion.div
                            className="flex gap-3 mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={currentUser.avatar}
                                alt={currentUser.name}
                              />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                ref={answerTextareaRef}
                                placeholder="Write an answer..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                className="resize-none text-sm focus-visible:ring-primary/20"
                                rows={2}
                              />
                              <div className="flex justify-end mt-2">
                                <motion.div
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleAnswerSubmit(question.id)
                                    }
                                    disabled={!newAnswer.trim() || isSubmitting}
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1" />
                                    Submit
                                    {isSubmitting && (
                                      <span className="animate-spin ml-1">
                                        ⟳
                                      </span>
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-muted/40 border shadow-sm">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">
                No questions yet. Be the first to ask!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

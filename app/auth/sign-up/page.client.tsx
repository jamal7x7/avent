"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseIcon, GraduationCapIcon, UserIcon } from "lucide-react"; // Added icons
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GitHubIcon } from "~/components/icons/github";
import { GoogleIcon } from "~/components/icons/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"; // Added RadioGroup
import { Separator } from "~/components/ui/separator";
import { admin, signIn, signUp } from "~/lib/auth-client";
import { type SignUpSchema, signUpSchema } from "~/lib/validation";
import { USER_ROLES, UserRole, toBetterAuthRole } from "~/types/role";

import { t } from "i18next";

// Simplified schema for this page (only name is needed for social sign-up)
const socialSignUpSchema = signUpSchema.pick({ name: true });
type SocialSignUpSchema = Pick<SignUpSchema, "name">;

export function SignUpPageClient() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<SocialSignUpSchema>({
    // Use simplified schema
    resolver: zodResolver(socialSignUpSchema),
    defaultValues: {
      name: "",
      // email, password, role removed
    },
  });

  // onSubmit is now only for the name field, potentially for future use
  // or could be removed if name is only captured post-social sign-up
  const onSubmit = async (data: SocialSignUpSchema) => {
    // This function might not be directly used if sign-up is only via social/email button
    console.log("Name submitted (if needed):", data.name);
    // Potentially store name temporarily if needed before social sign-up
  };

  const handleGitHubSignUp = () => {
    setLoading(true);
    try {
      // Social sign-up does not support role assignment directly
      // Optionally, show a note or handle role assignment after OAuth callback
      void signIn.social({ provider: "github" });
    } catch (err) {
      setError("Failed to sign up with GitHub");
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setLoading(true);
    try {
      void signIn.social({ provider: "google" });
    } catch (err) {
      setError("Failed to sign up with Google");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full ">
      {/* Left side - Image */}
      <div className="flex items-center justify-center p-4 md:p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center  space-y-4">
            <h2 className="text-3xl font-bold">{t("auth.signUp.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("auth.signUp.subtitle")}
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2 space-y-4">
              {/* Name field at the top */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("auth.signUp.nameLabel")}</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={t("auth.signUp.namePlaceholder")}
                    required
                  />
                  {errors.name && (
                    <span className="text-destructive text-xs">
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </form>

              {/* Google Button */}
              <Button
                variant="secondary"
                size={"lg"}
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="flex w-full items-center gap-2"
              >
                <GoogleIcon className="h-5 w-5" />
                {t("auth.signUp.continueWithGoogle")}
              </Button>

              {/* GitHub Button */}
              <Button
                variant="outline"
                size={"lg"}
                onClick={handleGitHubSignUp}
                disabled={loading}
                className="flex w-full items-center gap-2"
              >
                <GitHubIcon className="h-5 w-5" />
                {t("auth.signUp.continueWithGitHub")}
                {/* Needs translation */}
              </Button>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("auth.signUp.orSignUpWithEmail")}
                  </span>
                </div>
              </div>

              {/* Email Sign Up Button */}
              <Button
                variant="outline" // Or choose another variant
                onClick={() => router.push("/auth/sign-up/email")}
                disabled={loading}
                className="w-full"
              >
                {t("auth.signUp.signUpWithEmailButton")}{" "}
                {/* Needs translation */}
              </Button>

              {/* Error Message */}
              {error && (
                <p className="text-destructive text-center text-sm">{error}</p>
              )}

              {/* Sign In Link */}
              <div className="text-center text-sm">
                {t("auth.signUp.alreadyHaveAccount")}{" "}
                <Link href="/auth/sign-in" className="underline">
                  {t("auth.signUp.signInLink")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
    </div>
  );
}

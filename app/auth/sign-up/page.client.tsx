"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseIcon, GraduationCapIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"; // Add this import
import { GitHubIcon } from "~/components/icons/github";
import { GoogleIcon } from "~/components/icons/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { admin, signIn, signUp } from "~/lib/auth-client";
import { USER_ROLES, toBetterAuthRole } from "~/types/role";
import type { UserRole } from "~/types/role";
import * as z from "zod"; // Add zod import

// Define explicit validation schema since lib/validation.ts is missing
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "teacher", "staff"], { message: "Role is required" }),
});
type SignUpSchema = z.infer<typeof signUpSchema>;

// Remove the static import if it exists
// import { t } from "i18next";

// Define specific types for better type safety
interface BasicUser {
  id: string;
  email: string;
  // Add other potential properties if known
}

interface ListUsersResponse {
  users: BasicUser[];
  // Add other potential properties if known
}

// Filter out admin and superadmin roles
const availableRoles: UserRole[] = USER_ROLES.filter(
  (role) => role !== "admin" && role !== "superadmin",
);

// Use the full schema now
type FullSignUpSchema = SignUpSchema;

export function SignUpPageClient() {
  const { t } = useTranslation(); // Use the hook
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<FullSignUpSchema>({
    resolver: zodResolver(signUpSchema), // Use the full schema
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student", // Default role
    },
  });

  // Handles email sign-up
  const onSubmit = async (data: FullSignUpSchema) => {
    setError("");
    setLoading(true);
    try {
      await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (data.role !== "student") {
        let users: BasicUser[] = [];
        try {
          const usersResp = await admin.listUsers({
            query: { searchValue: data.email, searchField: "email" },
          });

          if (
            usersResp &&
            typeof usersResp === "object" &&
            usersResp !== null &&
            "users" in usersResp &&
            Array.isArray(usersResp.users)
          ) {
            users = (usersResp as ListUsersResponse).users;
          } else {
            console.warn(
              "Unexpected response structure or missing 'users' array from admin.listUsers:",
              usersResp,
            );
          }
        } catch (listUsersError) {
          console.error("Error fetching users:", listUsersError);
          setError("Failed to verify user details. Please try again later.");
          setLoading(false);
          return;
        }

        const user = users.find((u) => u.email === data.email);
        if (user?.id) {
          try {
            await admin.setRole({
              userId: user.id,
              role: toBetterAuthRole(data.role),
            });
          } catch (setRoleError) {
            console.error("Error setting user role:", setRoleError);
            setError(
              "Failed to set user role. Please contact support if this persists.",
            );
            // Decide if you want to stop the process or just log the error and continue
          }
        } else if (users.length > 0) {
          console.warn(
            `User with email ${data.email} created but not found immediately in listUsers response.`,
          );
        }
      }
      router.push("/auth/sign-in?registered=true");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignUp = () => {
    setLoading(true);
    try {
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
              {/* Role Selection */}
              <div className="grid gap-2">
                <Label>{t("auth.signUp.roleLabel")}</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                    >
                      {availableRoles.map((role) => {
                        // Use availableRoles here
                        const Icon =
                          role === "student"
                            ? GraduationCapIcon
                            : role === "teacher"
                              ? BriefcaseIcon
                              : UserIcon;
                        return (
                          <Label
                            key={role}
                            htmlFor={`role-${role}`}
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${field.value === role ? "border-primary" : ""}`}
                          >
                            <RadioGroupItem
                              value={role}
                              id={`role-${role}`}
                              className="sr-only"
                            />
                            <Icon className="mb-3 h-6 w-6" />
                            {t(`auth.roles.${role}`)} {/* Needs translation */}
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  )}
                />
                {errors.role && (
                  <span className="text-destructive text-xs">
                    {errors.role.message}
                  </span>
                )}
              </div>

              {/* Social Sign Up Buttons First */}
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
                {t("auth.signUp.continueWithGithub")}
              </Button>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("auth.signUp.orContinueWithEmail")}
                  </span>
                </div>
              </div>

              {/* Email/Password/Role Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
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

                {/* Email Field */}
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.signUp.emailLabel")}</Label>
                  <Input
                    dir="ltr"
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder={t("auth.signUp.emailPlaceholder")}
                    required
                  />
                  {errors.email && (
                    <span className="text-destructive text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Password Field */}
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {t("auth.signUp.passwordLabel")}
                  </Label>
                  <Input
                    dir="ltr"
                    id="password"
                    type="password"
                    {...register("password")}
                    required
                  />
                  {errors.password && (
                    <span className="text-destructive text-xs">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit Button for Email Form */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? t("auth.signUp.signingUp") // Needs translation
                    : t("auth.signUp.signUpButton")}
                </Button>
              </form>

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

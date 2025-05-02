"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseIcon, GraduationCapIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { admin, signUp } from "~/lib/auth-client";
import { type SignUpSchema, signUpSchema } from "~/lib/validation";
import { USER_ROLES, toBetterAuthRole } from "~/types/role";

import { t } from "i18next";

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

// Exclude 'name' as it's handled on the previous page or assumed collected via social
const emailSignUpSchema = signUpSchema.omit({ name: true });
type EmailSignUpSchema = Omit<SignUpSchema, "name">;

export function SignUpEmailPageClient() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<EmailSignUpSchema>({
    resolver: zodResolver(emailSignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  const onSubmit = async (data: EmailSignUpSchema) => {
    setError("");
    setLoading(true);
    try {
      // Assume 'name' needs to be passed; retrieve from state/context if needed, or adjust schema
      // For now, let's pass a placeholder or make it optional in the backend if possible.
      // A better approach would be to collect name on the previous step and pass it here.
      const tempName = "User"; // Placeholder - needs proper handling

      await signUp.email({
        email: data.email,
        password: data.password,
        name: tempName, // Pass the name
      });

      if (data.role !== "student") {
        let users: BasicUser[] = [];
        try {
          const usersResp = await admin.listUsers({
            query: { searchValue: data.email, searchField: "email" },
          });

          // Check if the response is valid and contains the users array
          if (
            usersResp &&
            typeof usersResp === "object" &&
            usersResp !== null && // Explicit null check for objects
            "users" in usersResp && // Check if 'users' property exists
            Array.isArray(usersResp.users) // Now check if it's an array
          ) {
            // Type assertion is safer here after all checks pass
            users = (usersResp as ListUsersResponse).users;
          } else {
            console.warn(
              "Unexpected response structure or missing 'users' array from admin.listUsers:", // Improved warning
              usersResp,
            );
            // Consider setting an error state or handling this case more robustly
          }
        } catch (listUsersError) {
          console.error("Error fetching users:", listUsersError);
          setError("Failed to verify user details. Please try again later.");
          setLoading(false); // Ensure loading state is reset
          return; // Exit the onSubmit function
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
            // Current logic continues to router.push below
          }
        } else if (users.length > 0) {
          // This case might indicate an issue if a user was expected but not found by email
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

  return (
    <div className="flex  items-center justify-center bg-background p-4">
      <Card className="w-full">
        <CardHeader className="text-center border-non shadow-non">
          <CardTitle className="text-2xl font-bold">
            {t("auth.signUpEmail.title")}
          </CardTitle>{" "}
          {/* Needs translation */}
          <CardDescription>{t("auth.signUpEmail.subtitle")}</CardDescription>{" "}
          {/* Needs translation */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.signUp.emailLabel")}</Label>
              <Input
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
            <div className="grid gap-2">
              <Label htmlFor="password">{t("auth.signUp.passwordLabel")}</Label>
              <Input
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

            {/* Role Selection using RadioGroup */}
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
                    {USER_ROLES.map((role) => {
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
                          className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem
                            value={role}
                            id={`role-${role}`}
                            className="sr-only"
                          />
                          <Icon className="mb-3 h-6 w-6" />
                          {role.charAt(0).toUpperCase() + role.slice(1)}
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

            {error && (
              <div className="text-sm font-medium text-destructive text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("auth.signUp.creatingButton")
                : t("auth.signUp.createButton")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/sign-up" className="underline">
              {t("auth.signUpEmail.backButton")} {/* Needs translation */}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitHubIcon } from "~/components/icons/github";
import { GoogleIcon } from "~/components/icons/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { signUp, admin, signIn } from "~/lib/auth-client";
import { signUpSchema, SignUpSchema } from "~/lib/validation";
import { USER_ROLES, UserRole, toBetterAuthRole } from "~/types/role";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function SignUpPageClient() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    setError("");
    setLoading(true);
    try {
      await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if (data.role !== "student") {
        // Use correct params for admin.listUsers: query as object
        const usersResp = await admin.listUsers({ query: { searchValue: data.email, searchField: "email" } });
        const users = Array.isArray((usersResp as any).users) ? (usersResp as any).users : [];
        const user = users.find((u: any) => u.email === data.email);
        if (user && user.id) {
          await admin.setRole({ userId: user.id, role: toBetterAuthRole(data.role) });
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
    <div className="grid h-screen w-screen md:grid-cols-2">
      {/* Left side - Image */}
      <div className="relative hidden md:block">
        <Image
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Sign-up background image"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <h1 className="text-3xl font-bold">Relivator</h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Store which makes you happy.
          </p>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to create your account
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                    required
                  />
                  {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="name@example.com"
                    required
                  />
                  {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    required
                  />
                  {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Role</SelectLabel>
                            {USER_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <span className="text-destructive text-xs">{errors.role.message}</span>}
                </div>
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleGitHubSignUp}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

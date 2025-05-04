"use client";

import { RiFacebookFill, RiGoogleFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next"; // Add this import
import FacebookIcon from "~/components/icons/facebook";
import { GitHubIcon } from "~/components/icons/github";
import { GoogleIcon } from "~/components/icons/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { signIn } from "~/lib/auth-client";

export function SignInPageClient() {
  const { t } = useTranslation(); // Use the hook
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
      });
      router.push("/dashboard/announcements");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setLoading(true);
    try {
      void signIn.social({ provider: "github" });
    } catch (err) {
      setError("Failed to sign in with GitHub");
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    try {
      void signIn.social({ provider: "google" });
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setLoading(true);
    try {
      void signIn.social({ provider: "facebook" });
    } catch (err) {
      setError("Failed to sign in with Facebook");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="grid  w-full">
      {/* Left side - Image */}
      <div className="flex  items-center justify-center bg-background md:p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{t("auth.signIn.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("auth.signIn.subtitle")}
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2 space-y-4">
              {/* Google Button First */}
              <Button
                variant="secondary"
                size={"lg"}
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center  bg-[#4285f4] hover:bg-[#1a73e8] text-white  gap-2"
              >
                <RiGoogleFill className="h-5 w-5" />
                {t("auth.signIn.continueWithGoogle")}
              </Button>

              {/* Other Social Logins (Optional) */}
              <div className="mt-4 grid grid-cols-1 gap-4">
                <Button
                  hidden={true}
                  size={"lg"}
                  variant="outline"
                  onClick={handleGitHubLogin}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <GitHubIcon className="h-5 w-5" />
                  {t("auth.signIn.continueWithGithub")}
                </Button>

                {/* Facebook Button */}
                <Button
                  hidden={true}
                  size={"lg"}
                  variant="outline"
                  onClick={handleFacebookLogin}
                  disabled={loading}
                  className="flex items-center gap-2 "
                >
                  <RiFacebookFill className="h-5 w-5" />
                  {t("auth.signIn.continueWithFacebook")}
                </Button>

                {/* Add other social logins here if needed */}
              </div>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("auth.signIn.orContinueWithEmail")}
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleEmailLogin(e);
                }}
                className="space-y-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.signIn.emailLabel")}</Label>
                  <Input
                    dir="ltr"
                    id="email"
                    type="email"
                    placeholder={t("auth.signIn.emailPlaceholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {t("auth.signIn.passwordLabel")}
                    </Label>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {t("auth.signIn.forgotPassword")}
                    </Link>
                  </div>
                  <Input
                    dir="ltr"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? t("auth.signIn.signingIn")
                    : t("auth.signIn.signInButton")}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {t("auth.signIn.noAccount")}{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("auth.signIn.signUpLink")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Login form */}
    </div>
  );
}

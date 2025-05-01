import type { Metadata } from "next";
import { SignUpEmailPageClient } from "./page.client";

// TODO: Add translations for title and description
export const metadata: Metadata = {
  title: "Sign Up with Email", // Replace with translation key
  description: "Create your account using email and password.", // Replace with translation key
};

export default function SignUpEmailPage() {
  return <SignUpEmailPageClient />;
}

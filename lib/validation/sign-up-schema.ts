import { z } from "zod";
import { USER_ROLES } from "~/types/role";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLES as [typeof USER_ROLES[number]]),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

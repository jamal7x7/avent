export type UserRole = "student" | "teacher" | "staff" | "admin" | "superadmin";

export const USER_ROLES: UserRole[] = [
  "student",
  "teacher",
  "staff",
  "admin",
  "superadmin",
];

// Map our app roles to better-auth roles
export function toBetterAuthRole(role: UserRole): "admin" | "user" {
  if (role === "admin" || role === "superadmin") return "admin";
  return "user";
}

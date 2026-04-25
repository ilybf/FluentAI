import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export type UserRole = "student" | "teacher" | "admin";

/**
 * Get the authenticated session and verify the user has the required role.
 * Returns the session if authorized, or a NextResponse error to return directly.
 */
export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userRole = (session.user.role || "student") as UserRole;

  if (!allowedRoles.includes(userRole)) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    session,
    role: userRole,
  };
}

/**
 * Shorthand: require admin role.
 */
export async function requireAdmin() {
  return requireRole("admin");
}

/**
 * Shorthand: require teacher or admin role.
 */
export async function requireTeacher() {
  return requireRole("teacher", "admin");
}

/**
 * Shorthand: require any authenticated user.
 */
export async function requireAuth() {
  return requireRole("student", "teacher", "admin");
}

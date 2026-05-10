import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    level: string;
    nativeLanguage: string;
    totalScore: number;
    role: string;
    avatarUrl?: string; // Optional — not stored in JWT to keep cookie small
  }

  interface Session {
    user: {
      id: string;
      level: string;
      nativeLanguage: string;
      totalScore: number;
      role: string;
      avatarUrl: string; // Always present (defaults to ""), fetched on-demand from API
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    level: string;
    nativeLanguage: string;
    totalScore: number;
    role: string;
    // avatarUrl intentionally excluded — stored in DB, fetched via /api/user
  }
}

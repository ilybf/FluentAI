import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    level: string;
    nativeLanguage: string;
    totalScore: number;
  }

  interface Session {
    user: {
      id: string;
      level: string;
      nativeLanguage: string;
      totalScore: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    level: string;
    nativeLanguage: string;
    totalScore: number;
  }
}

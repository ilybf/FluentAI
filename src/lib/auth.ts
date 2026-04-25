import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/mongoose";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials. Please provide both email and password.");
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+passwordHash");

          if (!user || !user.passwordHash) {
            throw new Error("Invalid credentials. User not found.");
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordMatch) {
            throw new Error("Invalid credentials. Incorrect password.");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.displayName,
            level: user.level,
            nativeLanguage: user.nativeLanguage,
            totalScore: user.totalScore,
            role: user.role || "student",
            avatarUrl: user.avatarUrl || "",
          };
        } catch (error: any) {
          console.error("Auth Authorize Error:", error.message);
          throw new Error(error.message || "An unexpected authentication error occurred.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.level = user.level as string;
        token.nativeLanguage = user.nativeLanguage as string;
        token.totalScore = user.totalScore as number;
        token.role = (user.role as string) || "student";
        token.avatarUrl = (user.avatarUrl as string) || "";
      }
      
      // Update token if session is updated
      if (trigger === "update" && session) {
        token.level = session.level || token.level;
        token.nativeLanguage = session.nativeLanguage || token.nativeLanguage;
        token.name = session.name || token.name;
        token.totalScore = session.totalScore ?? token.totalScore;
        token.role = session.role || token.role;
        token.avatarUrl = session.avatarUrl ?? token.avatarUrl;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.level = token.level;
        session.user.nativeLanguage = token.nativeLanguage;
        session.user.totalScore = token.totalScore;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

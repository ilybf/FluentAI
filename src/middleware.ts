import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const isAuthPage = 
    req.nextUrl.pathname === '/' || 
    req.nextUrl.pathname.startsWith('/login') || 
    req.nextUrl.pathname.startsWith('/register');

  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/chat') ||
    req.nextUrl.pathname.startsWith('/writing') ||
    req.nextUrl.pathname.startsWith('/reading') ||
    req.nextUrl.pathname.startsWith('/vocabulary') ||
    req.nextUrl.pathname.startsWith('/profile');

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/chat/:path*",
    "/writing/:path*",
    "/reading/:path*",
    "/vocabulary/:path*",
    "/profile/:path*"
  ],
};

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
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/classroom');

  const isTeacherRoute = req.nextUrl.pathname.startsWith('/teacher');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // Redirect authenticated users away from auth pages
  if (token && isAuthPage) {
    const role = (token.role as string) || 'student';
    const dest = role === 'admin' ? '/admin/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Redirect unauthenticated users to login
  if (!token && (isProtectedRoute || isTeacherRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect teachers/admins away from the student dashboard to their own
  if (token && req.nextUrl.pathname === '/dashboard') {
    const role = (token.role as string) || 'student';
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  // Role-based route protection: teacher routes
  if (token && isTeacherRoute) {
    const role = (token.role as string) || 'student';
    if (role !== 'teacher' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Role-based route protection: admin routes
  if (token && isAdminRoute) {
    const role = (token.role as string) || 'student';
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
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
    "/profile/:path*",
    "/classroom/:path*",
    "/teacher/:path*",
    "/admin/:path*",
  ],
};

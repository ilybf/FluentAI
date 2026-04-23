export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/writing/:path*",
    "/reading/:path*",
    "/vocabulary/:path*",
    "/api/chat/:path*",
    "/api/writing/:path*",
    "/api/reading/:path*",
    "/api/vocabulary/:path*",
  ],
};

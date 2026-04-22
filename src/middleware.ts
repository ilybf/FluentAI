export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/writing/:path*",
    "/api/chat/:path*",
    "/api/writing/:path*",
    "/api/reading/:path*",
  ],
};

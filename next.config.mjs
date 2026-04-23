/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression for all responses — reduces transfer size
  compress: true,
  // Opt into the stricter React mode that catches memory leaks from missing cleanups
  reactStrictMode: true,
};

export default nextConfig;

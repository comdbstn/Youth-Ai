import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['@supabase/supabase-js']
};

export default nextConfig;

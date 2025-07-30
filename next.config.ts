import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
};

export default nextConfig;

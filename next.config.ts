import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // API Routes を確実に認識させる
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  // ファイルアップロードのサイズ制限を設定  
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // React の Strict Mode を無効化（hydration 警告を減らすため）
  reactStrictMode: false,
};

export default nextConfig;

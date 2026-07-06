/** @type {import('next').NextConfig} */
const nextConfig = {
  // السماح بالصور الخارجية
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // تجاهل أخطاء ESLint أثناء البناء
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

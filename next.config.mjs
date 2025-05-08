/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL,
    },
    async rewrites() {
        return [
            {
                source: '/site/:path*',
                destination: '/api/:path*'
            }
        ]
    },
    experimental: {
        appDir: true,
    },

};

export default nextConfig;

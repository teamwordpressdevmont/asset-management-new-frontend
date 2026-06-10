/** @type {import('next').NextConfig} */

const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined in environment variables");
}

const nextConfig = {
    /* config options here */
    // reactCompiler: true,
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${API_BASE_URL}/:path*`,
            },
        ];
    },
};

export default nextConfig;

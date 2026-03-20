/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict Mode causa double-render em dev → piscadas e sensação de "reverter"
  reactStrictMode: false,
};

module.exports = nextConfig;


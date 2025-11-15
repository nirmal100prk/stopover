/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Allow cross-origin requests during development
  experimental: {
    allowedDevOrigins: ['localhost'],
  },
}

require('dotenv').config({path: 'backend/.env'})

module.exports = nextConfig
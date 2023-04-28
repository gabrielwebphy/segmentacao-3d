/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['web-ifc']);

const nextConfig = {
  reactStrictMode: false,

}

module.exports = withTM(nextConfig)

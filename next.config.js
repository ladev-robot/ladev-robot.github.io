/** @type {import('next').NextConfig} */

module.exports = {
  output: "export",
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx", "html"],
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
  },
  compiler: {
    removeConsole: true,
  },
};

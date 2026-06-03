const repo = "Blog";

/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
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

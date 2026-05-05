/** @type {import('next').NextConfig} */

// When deploying to GitHub Pages, set GITHUB_PAGES=true and PAGES_BASE=/<repo>.
// Local `npm run dev` and Vercel keep basePath empty so URLs stay clean.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? process.env.PAGES_BASE || "" : "";

const nextConfig = {
  ...(isPages ? { output: "export" } : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: isPages,
  images: { unoptimized: isPages },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;

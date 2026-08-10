import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Este projeto vive dentro de um monorepo com outro lockfile em
    // controlefinanceiro_backend/. Sem isso, a detecção automática de raiz
    // do Turbopack pode ficar ambígua em ambientes de CI (ex: Vercel).
    root: path.join(__dirname),
  },
};

export default nextConfig;

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoRoot = import.meta.dirname;

function readRootPackageVersion(): string {
  try {
    const raw = readFileSync(path.join(repoRoot, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version?.trim() || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function readGitShortSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

const appVersion = process.env.VITE_APP_VERSION?.trim() || readRootPackageVersion();
const appGitSha = process.env.VITE_APP_GIT_SHA?.trim() || readGitShortSha();
const appBuildTime = process.env.VITE_APP_BUILD_TIME?.trim() || new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    "import.meta.env.VITE_APP_GIT_SHA": JSON.stringify(appGitSha),
    "import.meta.env.VITE_APP_BUILD_TIME": JSON.stringify(appBuildTime),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

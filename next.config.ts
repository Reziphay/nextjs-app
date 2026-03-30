import type { NextConfig } from "next";

function resolveEnvValue(value?: string | null, fallback?: string | null) {
  const normalizedValue = value?.trim();

  if (normalizedValue && !normalizedValue.startsWith("$")) {
    return normalizedValue;
  }

  return fallback?.trim() ?? "";
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_API_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_API_URL,
      process.env.API_URL,
    ),
  },
};

export default nextConfig;

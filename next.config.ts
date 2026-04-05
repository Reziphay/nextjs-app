import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

function resolveEnvValue(value?: string | null, fallback?: string | null) {
  const normalizedValue = value?.trim();

  if (normalizedValue && !normalizedValue.startsWith("$")) {
    return normalizedValue;
  }

  return fallback?.trim() ?? "";
}

function getAllowedDevOrigins() {
  const hosts = new Set(["localhost", "127.0.0.1"]);

  const configuredOrigins = process.env.ALLOWED_DEV_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const configuredOrigin of configuredOrigins ?? []) {
    hosts.add(configuredOrigin);
  }

  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        hosts.add(address.address);
      }
    }
  }

  return Array.from(hosts);
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: getAllowedDevOrigins(),
  env: {
    NEXT_PUBLIC_API_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_API_URL,
      process.env.API_URL,
    ),
  },
};

export default nextConfig;

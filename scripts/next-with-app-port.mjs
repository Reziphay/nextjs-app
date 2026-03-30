import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const nextCliPath = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const nextArgs = process.argv.slice(2);
const command = nextArgs[0];
const mode = command === "dev" ? "development" : command === "start" ? "production" : null;
const initialEnvKeys = new Set(Object.keys(process.env));

function parseEnvValue(rawValue) {
  const trimmedValue = rawValue.trim();

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }

  const hashIndex = trimmedValue.indexOf("#");
  return hashIndex >= 0 ? trimmedValue.slice(0, hashIndex).trimEnd() : trimmedValue;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const fileContents = readFileSync(filePath, "utf8");

  for (const line of fileContents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const normalizedLine = trimmedLine.startsWith("export ")
      ? trimmedLine.slice("export ".length)
      : trimmedLine;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const value = parseEnvValue(normalizedLine.slice(separatorIndex + 1));

    if (!initialEnvKeys.has(key)) {
      process.env[key] = value;
    }
  }
}

const envFiles = [
  path.join(projectRoot, ".env"),
  mode ? path.join(projectRoot, `.env.${mode}`) : null,
  path.join(projectRoot, ".env.local"),
  mode ? path.join(projectRoot, `.env.${mode}.local`) : null,
].filter(Boolean);

for (const envFilePath of envFiles) {
  loadEnvFile(envFilePath);
}

if (!process.env.PORT && process.env.APP_PORT) {
  process.env.PORT = process.env.APP_PORT;
}

const child = spawn(process.execPath, [nextCliPath, ...nextArgs], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});

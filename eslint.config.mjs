import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: currentDirectory,
});

const config = [
  ...compat.config(nextVitals),
  ...compat.config(nextTypescript),
  {
    ignores: [".next/**", "next-env.d.ts", "node_modules/**"],
  },
];

export default config;

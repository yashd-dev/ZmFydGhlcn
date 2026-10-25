import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  env: core.env,
  extends: [core, react],
  ignorePatterns: [...core.ignorePatterns, "components/ui/**"],
  plugins: ["react", "typescript", "oxc"],
  rules: {
    "react/only-export-components": [
      "warn",
      {
        allowConstantExport: true,
      },
    ],
    "react/rules-of-hooks": "error",
  },
});

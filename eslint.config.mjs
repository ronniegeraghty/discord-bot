import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/build/**",
      "**/dist/**",
      "**/node_modules/**",
      "archive/**",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    rules: {
      // TypeScript already checks for undefined identifiers.
      "no-undef": "off",
      // The codebase intentionally uses `any` in a few discord.js seams.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-case-declarations": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "warn",
    },
  }
);

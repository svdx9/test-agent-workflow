import js from "@eslint/js";
import ts from "typescript-eslint";
import solid from "eslint-plugin-solid";
import eslintConfigPrettier from "eslint-config-prettier";

export default ts.config(
    {
        ignores: ["**/dist/**", "node_modules/", ".output/", "debug/"]
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            solid,
        },
        languageOptions: {
            parser: ts.parser,
            parserOptions: {
                project: true,
            },
        },
        rules: {
            // Directs ESLint to use Solid's specific JSX rules
            ...solid.configs.typescript.rules,
        },
    },
    eslintConfigPrettier // 2. Add this LAST to override conflicting rules
);

const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
        },
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off"
        },
    },
];
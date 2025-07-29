/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
	singleQuote: false,
	// trailingComma: "all",
	// semi: true,
	// tabWidth: 2,
	// bracketSpacing: true,
	// arrowParens: "always",
	// endOfLine: "lf",
	printWidth: 100,
	useTabs: true,
	overrides: [
		{
			files: ["**/*.{ts,mts,cts,tsx}"],
			options: {
				plugins: ["@prettier/plugin-oxc"],
				parser: "oxc-ts",
			}
		},
	],
};

export default config;

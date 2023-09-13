module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint"
  ],
  parserOptions: {
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "semi": ["error", "never"],
    "@typescript-eslint/semi": ["error", "never"],
    indent: [2, 2, { SwitchCase: 1}],
    // allow trailing comma
    "comma-dangle": ["error", "only-multiline"],
    "prefer-promise-reject-errors": 0,
    // allow paren-less arrow functions
    "arrow-parens": 0,
    quotes: "off",
    '@typescript-eslint/no-var-requires': "off",
    "no-return-assign": "off",
    // allow async-await
    "generator-star-spacing": 0,
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
  },
}

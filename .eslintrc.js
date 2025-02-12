module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-import'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:eslint-plugin-import/errors',
    'plugin:eslint-plugin-import/warnings',
    'plugin:eslint-plugin-import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['src/database/migrations/', 'src/database/seeds/', 'log-transport-process.js', 'loadtest'],
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/class-name-casing": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": ["off", { "accessibility": "explicit" }],
    '@typescript-eslint/interface-name-prefix': 'off',
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/quotes": ["error", "single", { "avoidEscape": true }],
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/unified-signatures": "error",
    "arrow-parens": ["off", "as-needed"],
    "camelcase": "off",
    "comma-dangle": ["error", "only-multiline"],
    "constructor-super": "error",
    "dot-notation": "error",
    "eqeqeq": ["error", "smart"],
    "guard-for-in": "error",
    "id-blacklist": "off",
    "id-match": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "parent", "sibling", "index"],
      "pathGroups": [
        {
          "pattern": "@app/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@cqrs/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@shared/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@service-request/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@service-provider/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@service-package/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@payment/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@wallet/**",
          "group": "external",
          "position": "after"
        },
        {
          "pattern": "@payout/**",
          "group": "external",
          "position": "after"
        }
      ],
      "pathGroupsExcludedImportTypes": ["builtin"],
      "alphabetize": { "order": "asc", "caseInsensitive": true },
      "newlines-between": "never",
    }],
    "import/namespace": "off",
    "max-len": ["error", { "code": 150 }],
    "new-parens": "error",
    "no-bitwise": "error",
    "no-console": 'error',
    "no-debugger": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-trailing-spaces": "error",
    "no-unused-expressions": "error",
    "no-unused-labels": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-const": "error",
    "radix": "error",
    "semi": ["error", "always"],
    "space-before-blocks": ["error", { "functions": "always", "keywords": "always", "classes": "always" }],
  },
  "settings": {
    "import/resolver": {
      typescript: {} // this loads <rootdir>/tsconfig.json to eslint
    },
  },
};

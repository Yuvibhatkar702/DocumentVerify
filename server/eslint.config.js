// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022, // or latest like "latest"
      sourceType: 'module', // if using ES modules
      globals: {
        ...globals.node, // predefined Node.js globals
        // add any other global variables your project uses, e.g.
        // myCustomGlobal: 'readonly',
      }
    },
    rules: {
      // You can override or add rules here
      // e.g., "no-unused-vars": "warn"
      "no-console": "warn", // Example: warn about console.log
      "indent": ["warn", 2],
      "quotes": ["warn", "single"],
      "semi": ["warn", "always"]
    },
    ignores: [
      "node_modules/",
      // add other paths to ignore if needed
    ]
  }
];

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      '.git/**',
      '.vscode/**',
      '*.log',
      '.eslintcache',
      'public/**'
    ]
  },
  {
    // Common rules for all files
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  },
  {
    // Config files like next.config.js, postcss.config.js, etc.
    files: ['*.config.js', '*.config.ts'],
    languageOptions: {
      globals: {
        module: true,
        require: true,
        process: true,
        __dirname: true,
        global: true
      }
    }
  },
  {
    // TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        window: true,
        document: true,
        console: true,
        process: true,
        fetch: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        crypto: true,
        NodeJS: true,
        JSX: true,
        global: true
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      'prefer-const': 'off'
    }
  }
];
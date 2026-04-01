module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-prettier',
    './.eslintrc-auto-import.json'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/no-mutating-props': 'warn',
    'vue/no-side-effects-in-computed-properties': 'warn',
    'vue/no-deprecated-filter': 'warn',
    'vue/valid-define-emits': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/no-dupe-keys': 'warn',
    'vue/require-valid-default-prop': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'no-useless-escape': 'warn',
    'no-redeclare': 'warn',
    'no-prototype-builtins': 'warn',
    'no-constant-condition': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'warn'
  }
}

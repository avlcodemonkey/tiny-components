module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:lit/recommended'
    ],    
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json']
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        'indent': ['error', 4, { 'ignoredNodes': ['TemplateLiteral *'] }],
        'linebreak-style': [2,'windows'],
        'class-methods-use-this': 'off',
        '@typescript-eslint/indent': ['error', 4, { 'ignoredNodes': ['TemplateLiteral *'] }],
        'max-len': ['error', 160],
        'import/extensions': 'off',
        'no-plusplus': 'off',
        '@typescript-eslint/lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
        'no-console': ['warn', { 'allow': ['warn', 'error'] }],
        'no-underscore-dangle': ['error', { 'allow': [ '_index'] }],
        'no-trailing-spaces': ['error'],
        'quotes': ['error', 'single'],
        'comma-dangle': ['error', 'always-multiline'],
    },
    ignorePatterns: ['/**/__tests__','.eslintrc.cjs']
};

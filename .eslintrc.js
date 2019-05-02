const OFF = 0;
const WARN = 1;
const ERROR = 2;
let rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = './bin';

module.exports = {
  plugins: ['react', 'rulesdir'],
  extends: ['eslint:recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    'browser': true,
    'node': true,
    'mocha': true,
    'es6': true
  },
  globals: {
    'importSpectrumCSS': 'readonly'
  },
  rules: {
    'comma-dangle': ERROR,
    'indent': OFF,
    'indent-legacy': [ERROR, ERROR, {SwitchCase: 1}],
    'quotes': [ERROR, 'single', 'avoid-escape'],
    'linebreak-style': [ERROR, 'unix'],
    'semi': [ERROR, 'always'],
    'space-before-function-paren': [ERROR, {anonymous: 'always', named: 'never', asyncArrow: 'ignore'}],
    'keyword-spacing': [ERROR, {after: true}],
    'jsx-quotes': [ERROR, 'prefer-double'],
    'brace-style': [ERROR, '1tbs', {allowSingleLine: true}],
    'object-curly-spacing': [ERROR, 'never'],
    'curly': ERROR,
    'no-fallthrough': OFF,
    'comma-spacing': ERROR,
    'comma-style': [ERROR, 'last'],
    'no-irregular-whitespace': [ERROR],
    'eqeqeq': [ERROR, 'smart'],
    'no-spaced-func': ERROR,
    'array-bracket-spacing': [ERROR, 'never'],
    'key-spacing': [ERROR, {beforeColon: false, afterColon: true}],
    'no-console': OFF,
    'no-unused-vars': [ERROR, {args: 'none', vars: 'all', varsIgnorePattern: '[rR]eact'}],
    'space-in-parens': [ERROR, 'never'],
    'space-unary-ops': [ERROR, {words: true, nonwords: false}],
    'spaced-comment': [ERROR, 'always', {exceptions: ['*']}],
    'max-depth': [WARN, 4],
    'radix': [ERROR, 'always'],
    'react/jsx-uses-react': WARN,
    'eol-last': ERROR,
    'arrow-body-style': [ERROR, 'as-needed'],
    'arrow-spacing': ERROR,
    'space-before-blocks': [ERROR, 'always'],
    'space-infix-ops': ERROR,
    'no-new-wrappers': ERROR,
    'no-self-compare': ERROR,
    'no-nested-ternary': ERROR,
    'no-multiple-empty-lines': ERROR,
    'no-unneeded-ternary': ERROR, 

    // Below are rules that are needed for linter functionality when using React
    'react/display-name': OFF,
    'react/jsx-curly-spacing': [ERROR, 'never'],
    'react/jsx-indent-props': [ERROR, 2],
    'react/jsx-no-duplicate-props': ERROR,
    'react/jsx-no-literals': OFF,
    'react/jsx-no-undef': ERROR,
    'react/jsx-quotes': OFF,
    'react/jsx-sort-prop-types': OFF,
    'react/jsx-sort-props': OFF,
    'react/jsx-uses-vars': ERROR,
    'react/no-danger': OFF,
    'react/no-did-mount-set-state': OFF,
    'react/no-did-update-set-state': ERROR,
    'react/no-multi-comp': OFF,
    'react/no-set-state': OFF,
    'react/no-unknown-property': ERROR,
    'react/react-in-jsx-scope': ERROR,
    'react/require-extension': OFF,
    'react/jsx-equals-spacing': ERROR,
    'react/jsx-max-props-per-line': [ERROR, {when: 'multiline'}],
    'react/jsx-closing-bracket-location': [ERROR, 'after-props'],
    'react/jsx-tag-spacing': ERROR,
    'react/jsx-indent': [ERROR, 2],
    'react/jsx-wrap-multilines': ERROR,
    'react/jsx-boolean-value': ERROR,
    'react/jsx-first-prop-new-line': [ERROR, 'multiline'],
    'react/self-closing-comp': ERROR,

    // custom rules
    'rulesdir/sort-imports': [ERROR]
  }
};

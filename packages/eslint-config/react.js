
module.exports = {
    extends: [
      './base',
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended"
    ],
    plugins: [
      "react",
      "react-hooks",
      "jsx-a11y"
    ],
    env: {
      browser: true,
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
}
module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "plugins": [
    "promise",
    "security"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:promise/recommended",
    "plugin:security/recommended"
  ],
  // "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
    },
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "rules": {
    "indent": [
      "error",
      2, {
        "SwitchCase": 1,
        "ignoredNodes": [
          "TemplateLiteral"
        ]
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ],
    "no-console": [
      "warn"
    ],
    "object-curly-spacing": [
      "error",
      "always", {
        "arraysInObjects": true,
        "arraysInObjects": true,
        "objectsInObjects": true,
        "objectsInObjects": true
      }
    ],
    "array-bracket-spacing": [
      "error",
      "always"
    ],
    "key-spacing": "error",
    "block-spacing": [
      "error",
      "always"
    ],
    "comma-spacing": "error",
    "template-tag-spacing": [
      "error",
      "never"
    ],
    "object-shorthand": "error"
  }
};

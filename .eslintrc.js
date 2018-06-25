module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  // "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
    },
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "plugins": [
  ],
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

module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js",
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/config.js",
    "<rootDir>/src/main.jsx",
    "<rootDir>/babel.config.cjs",
    "<rootDir>/jest.config.cjs",
  ],
};
module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "/node_modules/(?!(axios)/)" // нужно для ESM axios
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"]
};

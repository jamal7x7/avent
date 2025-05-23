module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
    "^.+\\.(js|jsx)$": ["babel-jest", { configFile: "./babel-jest.config.js" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/$1",
    " (.*)": "$1",
  },
};

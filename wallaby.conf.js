module.exports = function (wallaby) {
  return {
    files: ["src/**/*.ts", "src/**/*.js", "src/**/*.json"],

    tests: ["test/**/*.test.ts", "test/**/*.test.js"],

    env: {
      type: "node",
    },

    testFramework: "mocha",
  };
};

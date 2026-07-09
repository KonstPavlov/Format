const path = require("path");

// Standalone CRACO config: adds the "@" import alias and disables the
// build-time ESLint plugin so `npm run build` never fails on lint warnings.
module.exports = {
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};

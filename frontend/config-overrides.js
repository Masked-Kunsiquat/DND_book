module.exports = function override(config) {
    config.ignoreWarnings = [
      {
        message: /Failed to parse source map/, // Suppress source map warnings
      },
    ];
    return config;
  };
  
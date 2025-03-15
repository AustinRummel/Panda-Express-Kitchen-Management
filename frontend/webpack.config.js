module.exports = {
  // ...existing code...
  module: {
    rules: [
      // ...existing rules...
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              throwIfNamespace: false, // Allow namespace tags
            },
          },
        ],
      },
      // ...existing rules...
    ],
  },
  // ...existing code...
};

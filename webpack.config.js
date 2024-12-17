const path = require('path');

module.exports = {
  entry: './src/index.js',  // Adjust this to your entry file
  output: {
    filename: 'bundle.js',  // Adjust output filename
    path: path.resolve(__dirname, 'dist'), // Adjust output path
  },

  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,  // Use false if fs is not needed
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.tsx', // Specify your HTML template here

    }),
  ],

  // Additional Webpack configuration can go here
};
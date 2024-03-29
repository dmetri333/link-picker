const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'link-picker.js',
    libraryTarget: 'var',
    library: 'LinkPicker'
  }
};
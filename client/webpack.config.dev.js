const webpackConfig = require('./webpack.config');

const webpackDevConfig = { ...webpackConfig, mode: 'development' };

module.exports = webpackDevConfig;
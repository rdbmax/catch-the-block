const webpackConfig = require('./webpack.config');

const webpackDevConfig = {
    ...webpackConfig,
    devtool: 'source-map',
    mode: 'development',
};

module.exports = webpackDevConfig;
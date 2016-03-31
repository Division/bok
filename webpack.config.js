var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {

    module: {
        noParse: [/Performance.js/],
        loaders: [
            { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ["engine", "vendors"],
            minChunks: Infinity
        }),
        new ExtractTextPlugin("[name].css")
    ],

    entry: {
        vendors: ['lodash', 'jquery', 'backbone'],
        application: './app/Application.js'
    },

    devtool: 'source-map',

    output: {
        sourceMapFile:'[file].map',
        filename: '[name].js',
        chunkFilename: "[id].js",
        publicPath: '/build/',
        path: __dirname + '/build'
    },

    resolve: {

        alias: {

            Events: 'core/utils/Events',
            KeyCodes: 'core/utils/KeyCodes',
            Class: 'core/utils/Class',

            GameObject: 'core/abstract/GameObject',
            Level: 'core/abstract/Level',

            Engine: 'core/Engine',

            jquery: 'zepto',
            underscore: 'lodash'
        },

        root: [
            path.resolve('./app'),
            path.resolve('./vendor'),
            path.resolve('./assets')
        ]
    }

};

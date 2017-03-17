import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OfflinePlugin from 'offline-plugin';
import path from 'path';

const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: './index.js',

    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: '/',
        filename: 'bundle.js'
    },

    resolve: {
        extensions: ['', '.jsx', '.js', '.json'],
        modulesDirectories: [
            path.resolve(__dirname, "src/lib"),
            path.resolve(__dirname, "node_modules"),
            'node_modules'
        ],
        alias: {
            components: path.resolve(__dirname, "src/components"),    // used for tests
            'react': 'preact-compat',
            'react-dom': 'preact-compat'
        }
    },

    module: {
        preLoaders: [
            {
                test: /\.jsx?$/,
                exclude: /src\//,
                loader: 'source-map'
            }
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.(xml|html|txt|md)$/,
                loader: 'raw'
            },
            {
                test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
                loader: ENV==='production' ? 'file?name=[path][name]_[hash:base64:5].[ext]' : 'url'
            }
        ]
    },

    plugins: ([
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({ NODE_ENV: ENV })
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: { collapseWhitespace: true }
        }),
        new CopyWebpackPlugin([
            { from: './manifest.json', to: './' },
            { from: './favicon.ico', to: './' }
        ]),
        new OfflinePlugin({
            relativePaths: false,
            AppCache: false,
            publicPath: '/'
        })
    ]).concat(ENV==='production' ? [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            global_defs: { DEBUG: false }
        }),
        new webpack.BannerPlugin("persooAutocomplete 2.1; build from " + (new Date()).toISOString() +
                "\n© Persoo, s.r.o; Licensed MIT | github.com/persoo/persoo-autocomplete.", {})
    ] : [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: true },
            global_defs: { DEBUG: true }
        })
    ]),

    stats: { colors: true },

    node: {
        global: true,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
    },

    devtool: ENV==='production' ? 'source-map' : 'cheap-module-eval-source-map',

    devServer: {
        port: process.env.PORT || 8080,
        host: 'localhost',
        colors: true,
        publicPath: '/',
        contentBase: './src',
        historyApiFallback: true,
        open: true,
        proxy: {
            // OPTIONAL: proxy configuration:
            // '/optional-prefix/**': { // path pattern to rewrite
            //   target: 'http://target-host.com',
            //   pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
            // }
        }
    }
};

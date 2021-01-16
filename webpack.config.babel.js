import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import UglifyJsPlugin  from 'uglifyjs-webpack-plugin';
import path from 'path';

const ENV = process.env.NODE_ENV || 'development';

module.exports = {
    mode: ENV,
    context: path.resolve(__dirname, "src"),
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: '/',
        filename: 'bundle.js'
    },

    resolve: {
        extensions: ['.jsx', '.js', '.json'],
        modules: [
			path.resolve(__dirname, "src/lib"),
			path.resolve(__dirname, "node_modules"),
			'node_modules'
		],
        alias: {
            components: path.resolve(__dirname, "src/components"),    // used for tests
            'react': 'preact/compat',
            'react-dom': 'preact/compat'
        }
    },

    module: {
        rules:  [
            {
                 test: /\.jsx?$/,
                 exclude: path.resolve(__dirname, 'src'),
                 enforce: 'pre',
                 use: 'source-map-loader'
             },
             {
                 test: /\.jsx?$/,
                 exclude: /node_modules/,
                 use: 'babel-loader'
             },
             {
                 test: /\.json$/,
                 use: 'json-loader'
             },
             {
                 test: /\.(xml|html|txt|md)$/,
                 use: 'raw-loader'
             },
             {
                 test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
                 use: ENV === 'production' ? {
                     loader: 'file-loader',
                     options: {
                         name: '[path][name]_[hash:base64:5].[ext]'
                     }
                 } : {
                     loader: 'url-loader'
                 }
             }
         ]
    },

    plugins: ([
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: { collapseWhitespace: true }
        }),
        new CopyWebpackPlugin([
            { from: './manifest.json', to: './' },
            { from: './favicon.ico', to: './' }
        ])
    ]).concat(ENV==='production' ? [
        new webpack.DefinePlugin({
            DEBUG: JSON.stringify(false)
        }),
        new webpack.BannerPlugin("persooAutocomplete 2.5; build from " + (new Date()).toISOString() +
                "\n© Persoo, s.r.o; Licensed MIT | github.com/persoo/persoo-autocomplete.")
    ] : [
        new webpack.DefinePlugin({
            DEBUG: JSON.stringify(true)
        })
    ]),

    optimization: {
        minimize: true
    },

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
        publicPath: '/',
        contentBase: path.join(__dirname, 'src'),
        historyApiFallback: true,
        open: true
    }
};

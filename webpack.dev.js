/*Webpack файл для сборки development*/

const p = require('path');

const {
    path
} = require(p.resolve('wp-conf'));

module.exports = {

    mode: 'development',

    entry: {
        index: path.entry.index
        /*Можно добавить множество файлов, зависит от нужного количества бандлов*/
    },

    devtool: 'inline-source-map',

    watch: true,

    watchOptions: {
        ignored: /node_modules/
    },

    cache: {
        type: 'filesystem'
    },

    output: {
        path: path.output,
        filename: '[name].bundle.js'
    },

    module: {
        rules: [{
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },

            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: "defaults"
                            }]
                        ]
                    }
                }
            }
        ]
    }

};
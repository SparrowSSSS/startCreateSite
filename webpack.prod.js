/*Webpack файл для сборки production*/

const p = require('path');

const {
    path
} = require(p.resolve('wp-conf'));

module.exports = {

    mode: 'production',

    entry: {
        index: path.entry.index
        /*Можно добавить множество файлов, зависит от нужного количества бандлов*/
    },

    cache: {
        type: 'filesystem'
    },

    output: {
        path: path.output,
        filename: '[name]_[contenthash].bundle.js'
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
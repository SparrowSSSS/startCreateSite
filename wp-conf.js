/*Здесь содержатся все пути, которые используют webpack файлы*/

const path = require('path');

module.exports = {
    path: {
        entry: {
            index: path.resolve('dist/js', 'main.min.js')
            /*Можно добавить множество файлов, зависит от нужного количества бандлов*/
        },
        output: path.resolve('dist/bundles')
    }
};
const path = require('path')
const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('./package.json')

module.exports = initWebpackConfig({
    entries: {
        app: {
            import: path.join(__dirname, './app.js'),
            htmlTemplate: './static-template/index.html'
        }
    },
    outputPath: './public/',
    staticFilesPath: './static/',
    scss: {
        additionalData: '@import "~@stellar-expert/ui-framework/basic-styles/variables.scss"; @import "~/views/responsive-constants.scss";',
        sassOptions: {
            quietDeps: true,
            silenceDeprecations: ['import']
        }
    },
    define: {
        appVersion: pkgInfo.version
    },
    // Development only: proxy /explorer to api.stellar.expert server-side so local development avoids the
    // browser cross-origin 403 on price-display fetches. Production continues to fetch api.stellar.expert directly.
    devServer: {
        host: '0.0.0.0',
        server: {
            type: 'https'
        },
        port: 9001,
        proxy: [{
            context: ['/explorer'],
            target: 'https://api.stellar.expert',
            changeOrigin: true,
            secure: true,
            pathRewrite: requestPath => {
                const url = new URL(requestPath, 'http://localhost')
                url.searchParams.delete('origin')
                return url.pathname + url.search
            }
        }]
    }
})

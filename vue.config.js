module.exports = {
  publicPath: '/writer-network/',
  lintOnSave: false,
  chainWebpack: config => {
    // csv loader
    config.module
      .rule('csv')
      .test(/\.csv$/)
      .use('file-loader')
        .loader('file-loader')
        .end()
  },
  transpileDependencies: [
    'vuetify'
  ]
}

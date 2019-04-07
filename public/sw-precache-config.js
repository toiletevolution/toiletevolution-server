module.exports = {
  staticFileGlobs: [
    '/index.html',
    'elements/**/*',
    'manifest.json'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    }
  ],
  navigateFallback: '/index.html'
};
module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo ya incluye el plugin de Reanimated.
  return { presets: ['babel-preset-expo'] };
};

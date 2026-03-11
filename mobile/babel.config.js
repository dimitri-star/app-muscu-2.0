module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Fix: Zustand v5 uses import.meta.env (ESM syntax).
      // Metro doesn't support import.meta on web — transform it to undefined.
      function importMetaPlugin({ types: t }) {
        return {
          visitor: {
            MemberExpression(path) {
              if (
                t.isMetaProperty(path.node.object) &&
                path.node.object.meta.name === 'import' &&
                path.node.object.property.name === 'meta'
              ) {
                path.replaceWith(t.identifier('undefined'));
              }
            },
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                path.replaceWith(t.objectExpression([]));
              }
            },
          },
        };
      },
    ],
  };
};

const { isLayer } = require('./core');

const layers = layer => {
  const handles = Object.keys(layer);
  let i = 0;

  const nextLayer = () => {
    const handle = handles[i++];
    if (!handle) return null;
    const sublayer = layer[handle];
    if (isLayer(sublayer)) {
      return [handle, sublayer];
    } else {
      return nextLayer();
    }
  };

  return {
    [Symbol.iterator]() {
      return {
        next() {
          const node = nextLayer();
          if (node) {
            const [handle, sublayer] = node;
            return { done: false, value: { layer: sublayer, handle } };
          } else {
            return { done: true };
          }
        },
      };
    },
  };
};

module.exports = layers;

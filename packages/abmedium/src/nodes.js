const { isLayer, LAYER, DOCUMENT } = require('./core');
const layers = require('./layers');

const nodes = document => {
  const metalayers = [...layers(document)];
  const handles = Object.keys(document);
  let i = 0;

  const nextNode = () => {
    const handle = handles[i++];
    if (!handle || handle === LAYER || handle === DOCUMENT) return null;
    const value = document[handle];
    if (isLayer(value)) {
      return nextNode();
    } else {
      const metadata = {};
      for (const { handle: layerHandle, layer } of metalayers) {
        const metaValue = layer[handle];
        if (metaValue) metadata[layerHandle] = metaValue;
      }
      return { handle, value, metadata };
    }
  };

  return {
    [Symbol.iterator]() {
      return {
        next() {
          const node = nextNode();
          if (node) {
            return { done: false, value: node };
          } else {
            return { done: true };
          }
        },
      };
    },
  };
};

module.exports = nodes;

const { isDocument, isLayer, layer, sim } = require('./core');

const combined = resolved => (a, b) => {
  const bValue = isDocument(b) ? b.value() : b;

  for (const handle of Object.keys(bValue)) {
    const val = bValue[handle];
    if (isLayer(val)) {
      a[handle] = combined(resolved)(layer(a[handle]), val);
    } else {
      a[handle] = resolved(a[handle], val);
    }
  }

  return a;
};

module.exports = {
  combined,
  merged: combined((a, b) => (a === undefined ? b : sim([a, b]))),
  replaced: combined((_, b) => b),
};

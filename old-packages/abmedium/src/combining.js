const { isLayer, layer, sim } = require('./core');

const combined = resolved => (a, b) => {
  if (!isLayer(a) || !isLayer(b)) {
    throw new Error('combined only accepts layer arguments');
  }
  const ret = layer({ ...a });

  for (const handle of Object.keys(b)) {
    const val = b[handle];
    if (isLayer(val)) {
      ret[handle] = combined(resolved)(layer(ret[handle]), val);
    } else {
      ret[handle] = resolved(ret[handle], val);
    }
  }

  return ret;
};

module.exports = {
  combined,
  merged: combined((a, b) => (a === undefined ? b : sim(a, b))),
  replaced: combined((_, b) => b),
};

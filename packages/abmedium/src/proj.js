const {
  isEqual,
  valtype,
  disagreement,
  layer,
  isLayer,
  isDocument,
  LAYER,
  DOCUMENT,
} = require('./core');

const projectValue = (projection, handl, newVal) => {
  if (!valtype(newVal, 'map')) {
    projection[handl] = newVal;
    return;
  }

  const oldVal = projection[handl];
  if (oldVal === undefined) {
    projection[handl] = newVal.to;
    return;
  }

  if (!isEqual(oldVal, newVal.from)) {
    projection[handl] = disagreement(newVal.from, oldVal, newVal.to);
  } else {
    projection[handl] = newVal.to;
  }
};

const projectLayer = (projection, layer, stack = [], metalayers = []) => {
  const val = handl => layer[handl];
  for (const handl of Object.keys(layer)) {
    if (handl === LAYER || handl === DOCUMENT) continue;
    const v = val(handl);
    if (isLayer(v)) continue;
    projectValue(projection, handl, v);
  }
  for (const _stack of stack) {
    const [subLayerName, subStack = []] = Array.isArray(_stack)
      ? _stack
      : [_stack];
    projectLayer(projection, val(subLayerName), subStack, metalayers);
  }
  for (const mlayer of metalayers) {
    const metaValues = layer[mlayer];
    if (!metaValues) continue;
    projection[mlayer] = { ...metaValues, ...(projection[mlayer] || {}) };
  }
  return projection;
};

const proj = (doc, stack = [], metalayers = []) => {
  if (!isDocument(doc)) {
    throw new Error('Not a document');
  }
  const projection = {};
  projectLayer(projection, doc, stack, metalayers);
  return layer(projection);
};

module.exports = proj;

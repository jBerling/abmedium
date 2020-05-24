const { isLayer, valtype, valueOf, valueOfSim, root } = require('./core');

const pres = (docWithMetadata, nodePresenter = v => v, rootNode = root) => {
  const doc = {};
  const metalayers = {};

  for (const key of Object.keys(docWithMetadata)) {
    const value = docWithMetadata[key];
    if (isLayer(value)) metalayers[key] = value;
    else doc[key] = value;
  }

  if (doc[rootNode] === undefined) {
    throw new Error(
      'A fragment can not be presented. The document has no root.'
    );
  }

  // todo: what is happening here? A bit complicated?
  // Is it a leftover from the earlier more complicated
  // extension implementation?
  const val = valueOf(valueOfSim)(doc);

  const metaOfNode = (h, parent, pos) =>
    Object.keys(metalayers).reduce(
      (metadata, layer) => ({ ...metadata, [layer]: metalayers[layer][h] }),
      { pos, parent }
    );

  const graph = (v, parent) => {
    if (valtype(v, 'seq')) {
      return v.map((h, pos) =>
        nodePresenter(graph(val(h), h), h, metaOfNode(h, parent, pos))
      );
    }
    return v;
  };

  return nodePresenter(
    graph(val(rootNode), rootNode),
    rootNode,
    metaOfNode(rootNode)
  );
};

module.exports = { pres };

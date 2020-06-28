const { isLayer, valtype } = require('./core');

const treeOf = (docWithMetadata, nodePresenter = v => v, rootNode = 0) => {
  const doc = {};
  const metalayers = {};

  for (const key of Object.keys(docWithMetadata)) {
    const value = docWithMetadata[key];
    if (isLayer(value)) metalayers[key] = value;
    else doc[key] = value;
  }

  if (doc[rootNode] === undefined) {
    throw new Error('Pass a root node. The document has no default root node');
  }

  const val = handle => doc[handle];

  const metaOfNode = (h, parent, pos) =>
    Object.keys(metalayers).reduce(
      (metadata, layer) => ({ ...metadata, [layer]: metalayers[layer][h] }),
      { pos, parent }
    );

  const graph = (v, parent) => {
    if (valtype(v, 'seq')) {
      return v[1].map((h, pos) =>
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

module.exports = treeOf;

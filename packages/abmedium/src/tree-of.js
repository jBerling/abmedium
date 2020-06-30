const { isLayer, valtype, seq } = require('./core');

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

  const graph = (handle, parentHandle, pos) =>
    valtype(val(handle), {
      seq: ([, items]) =>
        nodePresenter(
          seq(
            ...items.map((childHandle, childPos) =>
              graph(childHandle, handle, childPos)
            )
          ),
          handle,
          metaOfNode(handle, parentHandle, pos)
        ),
      _: v => nodePresenter(v, handle, metaOfNode(handle, parentHandle, pos)),
    });

  return graph(rootNode);
};

module.exports = treeOf;

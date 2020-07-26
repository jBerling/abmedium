import { isLayer, valtype, seq, sim, disagreement } from "./core";

export const treeOf = (
  docWithMetadata,
  nodePresenter = (v, _, __) => v,
  rootNode = 0
) => {
  const doc = {};
  const metalayers = {};

  for (const key of Object.keys(docWithMetadata)) {
    const value = docWithMetadata[key];
    if (isLayer(value)) metalayers[key] = value;
    else doc[key] = value;
  }

  if (doc[rootNode] === undefined) {
    throw new Error("Pass a root node. The document has no default root node");
  }

  const val = (handle) => doc[handle];

  const metaOfNode = (h, parent, pos) =>
    Object.keys(metalayers).reduce(
      (metadata, layer) => ({ ...metadata, [layer]: metalayers[layer][h] }),
      { pos, parent }
    );

  const graph = (handle, parentHandle, pos) => {
    const node = (v) =>
      nodePresenter(v, handle, metaOfNode(handle, parentHandle, pos));

    return valtype(val(handle), {
      seq: ([, items]) =>
        node(
          seq(
            ...items.map((childHandle, childPos) =>
              graph(childHandle, handle, childPos)
            )
          )
        ),

      sim: ([, items]) => node(sim(...items.map(node))),

      dis: ([, { expected, actual, to }]) =>
        node(disagreement(node(expected), node(actual), node(to))),

      _: (v) => node(v),
    });
  };

  return graph(rootNode, undefined, undefined);
};

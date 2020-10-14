import { Projection, ProjNode, Metadata, NodeValue } from "./types";

export const nodes = <M extends Metadata, T extends NodeValue = NodeValue>(
  projection: Projection<M, T>
): Iterable<ProjNode<M, T>> => {
  const labels = Object.keys(projection.nodes);
  let i = 0;

  const nextNode = (): ProjNode<M, T> | undefined => {
    const label = labels[i++];
    if (!label) return undefined;
    return projection.nodes[label];
  };

  return {
    [Symbol.iterator]() {
      return {
        next() {
          const node = nextNode();
          if (node) {
            return { done: false, value: node };
          } else {
            return { done: true, value: undefined };
          }
        },
      };
    },
  };
};

import { asRef } from "./core";
import { Projection, Label, Ref, ProjectionNode, Metadata } from "./types";

export const node = <M extends Metadata>(
  projection: Projection<M>,
  labelOrRef: Label | Ref
): ProjectionNode<M> | undefined => {
  const ref = asRef(labelOrRef);
  const label = ref ? ref[1] : (labelOrRef as Label);
  return projection.nodes[label];
};

export const nodes = <M extends Metadata>(
  projection: Projection<M>
): Iterable<ProjectionNode<M>> => {
  const labels = Object.keys(projection.nodes);
  let i = 0;

  const nextNode = (): ProjectionNode<M> | undefined => {
    const label = labels[i++];
    if (!label) return undefined;
    return node(projection, label);
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

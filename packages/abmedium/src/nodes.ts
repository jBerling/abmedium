import { asRef } from "./core";
import {
  Projection,
  Metalayer,
  NodeValue,
  Label,
  Ref,
  ProjectionNode,
} from "./types";

const metadataOf = (
  label: Label,
  metadata: Record<Label, Metalayer>
): Record<Label, NodeValue> =>
  Object.keys(metadata).reduce(
    (md, mlabel) => ({
      ...md,
      [mlabel]: metadata[mlabel]?.[label],
    }),
    {}
  );

export const node = (
  projection: Projection,
  labelOrRef: Label | Ref
): ProjectionNode | undefined => {
  const ref = asRef(labelOrRef);
  const label = ref ? ref[1] : (labelOrRef as Label);
  const value = projection.nodes[label];

  if (value === undefined) return undefined;

  return {
    label,
    value,
    metadata: metadataOf(label, projection.metadata),
    simultaneities: projection.simultaneities[label],
    disagreement: projection.disagreements[label],
  };
};

export const nodes = (projection: Projection): Iterable<ProjectionNode> => {
  const labels = Object.keys(projection.nodes);
  let i = 0;

  const nextNode = (): ProjectionNode | undefined => {
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

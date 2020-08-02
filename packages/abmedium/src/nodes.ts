import { asLayer } from "./core";
import { Projection, Metalayer, NodeValue, Label } from "./types";

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

export const nodes = (projection: Projection) => {
  const labels = Object.keys(projection.nodes);
  let i = 0;

  const nextNode = () => {
    const label = labels[i++];
    if (!label) return null;

    const value = projection.nodes[label];

    if (asLayer(value)) {
      return nextNode();
    } else {
      return {
        label: label,
        value,
        metadata: metadataOf(label, projection.metadata),
      };
    }
  };

  return {
    [Symbol.iterator]() {
      return {
        next() {
          const node = nextNode();
          if (node) {
            return { done: false, value: node };
          } else {
            return { done: true };
          }
        },
      };
    },
  };
};

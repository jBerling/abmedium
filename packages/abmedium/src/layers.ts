import { asLayer } from "./core";
import { Layer, Label } from "./types";

export const layers = (
  layer: Layer
): Iterable<{ label: Label; layer: Layer }> => {
  const labels = Object.keys(layer);
  let i = 0;

  const nextLayer = (): [Label, Layer] | null => {
    const label = labels[i++];
    if (!label) return null;
    const sublayer = asLayer(layer[label]);
    if (sublayer) return [label, sublayer];
    else return nextLayer();
  };

  return {
    [Symbol.iterator](): Iterator<{ label: Label; layer: Layer }> {
      return {
        next(): any {
          const node = nextLayer();
          if (node) {
            const [label, sublayer] = node;
            return { done: false, value: { layer: sublayer, label } };
          } else {
            return { done: true };
          }
        },
      };
    },
  };
};

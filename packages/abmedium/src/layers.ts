import { Document, Layer, Metadata } from "./types";
import Automerge from "automerge";

export const layers = <M extends Metadata>(
  document: Automerge.FreezeObject<Document<M>>
): Iterable<Layer<M>> => {
  const labels = Object.keys(document.layers);
  let i = 0;

  const nextLayer = () => {
    const label = labels[i++];
    if (!label) return null;
    return document.layers[label];
  };

  return {
    [Symbol.iterator](): Iterator<Layer<M>> {
      return {
        next(): any {
          const value = nextLayer();
          if (value) {
            return { done: false, value };
          } else {
            return { done: true };
          }
        },
      };
    },
  };
};

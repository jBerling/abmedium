import { Document, Metadata } from "./types";
import { layer } from "./core";

export const document = <M extends Metadata>(): Document<M> => ({
  layers: { base: layer<M>() },
  compositions: {
    default: { label: "base" },
  },
});

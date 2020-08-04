import { Layer, Label, NodeValue, asLayer } from "@abrovink/abmedium";

export const addIn = (layer: Layer, path: Label[], value: NodeValue) => {
  const prop = path[path.length - 1];

  if (prop === undefined) {
    throw new Error("prop was undefined");
  }

  const sublayers = path.slice(0, path.length - 1);

  let sublayer: Layer = layer;
  for (const label of sublayers) {
    const l = asLayer(sublayer[label]);

    if (l) {
      sublayer = l;
      continue;
    }

    sublayer = sublayer[label] = {};
  }

  sublayer[prop] = value;
};

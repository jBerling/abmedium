import { dis, asLayer, isMetalayerLabel, isEqual } from "./core";

import { trackedLabel, metaPrefix } from "./constants";

import {
  ViewStack,
  Metalayer,
  Projection,
  Label,
  NodeValue,
  Layer,
} from "./types";

const projectValue = (
  projection: Projection,
  label: Label,
  newVal: NodeValue,
  trackedVal?: NodeValue
): void => {
  const actual = projection.nodes[label];

  projection.nodes[label] = newVal as any;

  if (!isEqual(actual, trackedVal)) {
    projection.disagreements[label] = dis(trackedVal, actual, newVal);
  }
};

const projectLayer = (
  projection: Projection,
  layer: Layer = {},
  stack: ViewStack = []
) => {
  const trackedValues = layer[trackedLabel] || {};

  for (const label of Object.keys(layer)) {
    const value = layer[label];

    if (value === undefined) continue;

    const sublayer = asLayer(value);
    if (sublayer) {
      if (!isMetalayerLabel(label)) continue;
      // projection[label] = {
      //   ...((projection[label] as any) || {}),
      //   ...sublayer,
      // };

      const metaLabel = label.slice(metaPrefix.length);
      projection.metadata[metaLabel] = {
        ...(projection.metadata[metaLabel] || {}),
        ...(sublayer as Metalayer),
      };
      continue;
    }

    projectValue(projection, label, value as any, trackedValues[label]);
  }

  for (const stackSegment of stack) {
    const [sublayerName, substack = []] = Array.isArray(stackSegment)
      ? stackSegment
      : [stackSegment];
    const sublayer = asLayer(layer[sublayerName]);
    if (!sublayer) continue;
    projectLayer(projection, sublayer, substack);
  }
};

export const proj = (layer: Layer, stack: ViewStack = []): Projection => {
  const projection: Projection = {
    nodes: {},
    metadata: {},
    simultaneities: {},
    disagreements: {},
  };
  projectLayer(projection, layer, stack);
  return projection;
};

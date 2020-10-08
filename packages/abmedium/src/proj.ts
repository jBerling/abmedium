import Automerge from "automerge";

import { dis, sim, isEqual } from "./core";

import {
  Projection,
  Document,
  LayerComposition,
  Layer,
  Metadata,
  NodeValue,
} from "./types";

const projectLayer = <M extends Metadata>(
  projection: Projection<M>,
  layer: Automerge.FreezeObject<Layer<M>>
) => {
  for (const node of Object.values(layer as Layer<M>)) {
    const { label, value, tracked } = node;
    const actual = projection.nodes[label]?.value;
    projection.nodes[label] = node;

    const simultaneities = Automerge.getConflicts(layer, label);
    if (simultaneities) {
      projection.nodes[label].simultaneities = sim(
        node.value,
        ...(Object.values(simultaneities) as any).map(
          (n: typeof node): NodeValue => n.value
        )
      );
    }

    if (!isEqual(actual, tracked)) {
      projection.nodes[label].disagreement = dis({
        expected: tracked,
        actual,
        to: value,
      });
    }
  }
};

const projectLayers = <M extends Metadata>(
  projection: Projection<M>,
  document: Automerge.FreezeObject<Document<M>>,
  composition: LayerComposition
) => {
  const layer = document.layers[composition.label];

  if (!layer) return;

  projectLayer(projection, layer);

  if (!composition.layers || !composition.layers.length) return;

  for (const comp of composition.layers) {
    projectLayers(projection, document, comp);
  }
};

export const proj = <M extends Metadata>(
  document: Automerge.FreezeObject<Document<M>>,
  composition: LayerComposition = document.compositions.default
): Projection<M> => {
  const projection: Projection<M> = {
    nodes: {},
  };

  projectLayers(projection, document, composition);

  return projection;
};

import Automerge from "automerge";

import { dis, sim, isEqual } from "./core";

import { mSetIn } from "./util";

import {
  Projection,
  Document,
  LayerComposition,
  Layer,
  Metadata,
  NodeValue,
  Node,
} from "./types";

const projectLayer = <M extends Metadata>(
  projection: Projection<M>,
  layer: Automerge.FreezeObject<Layer<M>>
) => {
  for (const node of Object.values(layer)) {
    const { label, value, tracked } = node;
    const actual = projection.nodes[label]?.value;
    projection.nodes[label] = node as Node<M, NodeValue>;

    // const simultaneities = Automerge.getConflicts(layer, label);
    // if (simultaneities) {
    //   projection.nodes[label].simultaneities = sim(
    //     node.value,
    //     ...(Object.values(simultaneities) as any).map(
    //       (n: typeof node): NodeValue => n.value
    //     )
    //   );
    // }

    // const simultaneities: Record<string, NodeValue> = Automerge.getConflicts(
    //   layer[label],
    //   "value"
    // );
    // if (simultaneities) {
    //   projection.nodes[label].simultaneities = sim(
    //     node.value,
    //     ...Object.values(simultaneities)
    //   );
    // }

    const nodeSimultaneities = Automerge.getConflicts(layer, label);

    if (nodeSimultaneities) {
      projection.simultaneities = Object.keys(nodeSimultaneities).reduce(
        (acc, key) => {
          const actorId = key.split("@")[1];
          const actorSims = acc[actorId] || {};

          return {
            ...acc,
            [actorId]: { ...actorSims, [label]: nodeSimultaneities[key] },
          };
        },
        projection.simultaneities || {}
      );
    }

    for (const prop of Object.keys(node)) {
      const conflicts = Automerge.getConflicts(node, prop as keyof Node<M>);
      if (!conflicts) continue;

      for (const key of Object.keys(conflicts)) {
        const actorId = key.split("@")[1];

        mSetIn(
          projection.nodes,
          [String(label), "simultaneities", actorId, prop],
          conflicts[key]
        );
      }
    }

    for (const prop of Object.keys(node.metadata)) {
      const conflicts = Automerge.getConflicts(node.metadata, prop);
      if (!conflicts) continue;

      for (const key of Object.keys(conflicts)) {
        const actorId = key.split("@")[1];

        mSetIn(
          projection.nodes,
          [String(label), "simultaneities", actorId, "metadata", prop],
          conflicts[key]
        );
      }
    }

    // if (!isEqual(actual, tracked)) {
    //   // TODO: remove use of dis, just create {expected, actual, to} directly
    //   projection.nodes[label].disagreement = dis({
    //     expected: tracked,
    //     actual,
    //     to: value,
    //   });
    // }
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

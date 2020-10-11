import Automerge from "automerge";

import { isEqual, nodeValueOf } from "./core";

import { mSetIn } from "./util";

import {
  Projection,
  Document,
  LayerComposition,
  Layer,
  Metadata,
  NodeValue,
  Node,
  Label,
} from "./types";

const projectLayer = <M extends Metadata>(
  projection: Projection<M>,
  layerLabel: Label,
  layer: Automerge.FreezeObject<Layer<M>>
) => {
  for (const node of Object.values(layer)) {
    const actual = projection.nodes[node.label];

    const shadowedNode = projection.nodes[node.label];
    const shadowedDisagreements = shadowedNode?.disagreements;

    projection.nodes[node.label] = node as Node<M, NodeValue>;

    if (shadowedDisagreements) {
      mSetIn(
        projection.nodes,
        [node.label, "disagreements"],
        shadowedDisagreements
      );
    }

    const nodeSimultaneities = Automerge.getConflicts(layer, node.label);

    if (nodeSimultaneities) {
      for (const key of Object.keys(nodeSimultaneities)) {
        const actorId = key.split("@")[1];
        mSetIn(
          projection,
          ["simultaneities", node.label, actorId],
          nodeSimultaneities[key]
        );
      }
    }

    for (const prop of Object.keys(node)) {
      // TODO, why do I need to use any?
      const conflicts = Automerge.getConflicts(
        node as any,
        prop as keyof Node<M>
      );
      if (!conflicts) continue;

      for (const key of Object.keys(conflicts)) {
        const actorId = key.split("@")[1];

        mSetIn(
          projection.nodes,
          [String(node.label), "simultaneities", actorId, prop],
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
          [String(node.label), "simultaneities", actorId, "metadata", prop],
          conflicts[key]
        );
      }
    }

    // Check value disagreement
    if (
      !isEqual(
        actual && nodeValueOf(actual),
        node.tracked && nodeValueOf(node.tracked as Node<any, any>)
      )
    ) {
      mSetIn(projection.nodes, [node.label, "disagreements", layerLabel], {
        expected: node.tracked,
        actual: actual && nodeValueOf(actual),
        to: nodeValueOf(node),
      });
    }

    if (node.trackedMeta) {
      for (const prop of Object.keys(node.trackedMeta)) {
        if (!isEqual(actual.metadata[prop], node.trackedMeta[prop])) {
          mSetIn(
            projection.nodes,
            [
              node.label,
              "disagreements",
              layerLabel,
              "metadata",
              "expected",
              prop,
            ],
            node.trackedMeta[prop]
          );

          mSetIn(
            projection.nodes,
            [
              node.label,
              "disagreements",
              layerLabel,
              "metadata",
              "actual",
              prop,
            ],
            actual.metadata[prop]
          );

          mSetIn(
            projection.nodes,
            [node.label, "disagreements", layerLabel, "metadata", "to", prop],
            node.metadata[prop]
          );
        }
      }
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

  projectLayer(projection, composition.label, layer);

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

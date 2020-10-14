// TODO rename back to pres

import { presNodeswitch } from "./nodeswitch";
import { valtype } from "./core";
import {
  Label,
  NodePresenter,
  Projection,
  Metadata,
  Seq,
  NodeValue,
} from "./types";

export const pres = <M extends Metadata, R, T extends NodeValue = NodeValue>(
  projection: Projection<M, T>,
  nodePresenter: NodePresenter<M, R, T> = presNodeswitch<M, R, T>({
    _: (n: any) => n,
  }),
  rootLabel: Label = 0,
  pos?: number,
  parent?: Label
): R => {
  const node = projection.nodes[rootLabel];

  if (!node) {
    throw new Error("No node with label " + rootLabel);
  }

  let items: R[] | undefined;

  if (valtype(node) === "seq") {
    items = (node as Seq).value.map((label, pos) =>
      pres(projection, nodePresenter, label, pos, rootLabel)
    );
  }

  return nodePresenter(
    {
      ...node,
      items,
      pos,
      parent,
    },
    items,
    projection.simultaneities && projection.simultaneities[rootLabel]
  );
};

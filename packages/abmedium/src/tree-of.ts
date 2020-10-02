import { valswitch } from "./valswitch";
import { Label, NodePresenter, Projection, Scalar, Metadata } from "./types";
import { asSeq } from "./core";

export const defaultNodePresenter: NodePresenter<any, Scalar | Scalar[]> = ({
  value,
  items,
}) =>
  valswitch<Scalar | Scalar[]>({
    seq: items as Scalar[],
    // TODO: Add presented items here.
    sim: (/*[, items]*/) => {
      throw new Error("not implemented");
    },
    _: value as Scalar,
  })(value, items);

export const treeOf = <M extends Metadata, R>(
  projection: Projection<M>,
  nodePresenter: NodePresenter<M, R> = defaultNodePresenter as any,
  rootLabel: Label = 0,
  pos?: number,
  parent?: Label
): R => {
  const node = projection.nodes[rootLabel];

  let items: R[] | undefined;
  const seq = asSeq(node.value);
  if (seq) {
    items = seq[1].map((label, pos) =>
      treeOf(projection, nodePresenter, label, pos, rootLabel)
    );
  }

  return nodePresenter({
    ...node,
    items,
    pos,
    parent,
  });
};

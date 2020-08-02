import { valswitch } from "./valswitch";
import {
  Label,
  NodePresenter,
  Metalayer,
  Projection,
  Scalar,
  NodeValue,
  PresentationNode,
} from "./types";
import { asSeq } from "./core";

export const defaultNodePresenter: NodePresenter<Scalar | Scalar[]> = ({
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

const metadataOf = (
  label: Label,
  metadata: Record<Label, Metalayer>
): Record<Label, NodeValue> =>
  Object.keys(metadata).reduce(
    (md, mlabel) => ({
      ...md,
      [mlabel]: metadata[mlabel]?.[label],
    }),
    {}
  );

export const presentationNodePresenter: NodePresenter<PresentationNode<
  PresentationNode
>> = (node): PresentationNode<PresentationNode<any>> => node;

export const treeOf = <R = Scalar>(
  projection: Projection,
  nodePresenter: NodePresenter<R> = defaultNodePresenter as any,
  rootLabel: Label = 0,
  pos?: number,
  parent?: Label
): R => {
  const value = projection.nodes[rootLabel] as NodeValue;

  let items: R[] | undefined;
  const seq = asSeq(value);
  if (seq) {
    items = seq[1].map((label, pos) =>
      treeOf(projection, nodePresenter, label, pos, rootLabel)
    );
  }

  const disagreement = projection.disagreements[rootLabel];

  const simultaneities = projection.simultaneities[rootLabel];

  return nodePresenter({
    value,
    items,
    pos,
    parent,
    label: rootLabel,
    disagreement: disagreement && disagreement[1],
    simultaneities: simultaneities && simultaneities[1],
    metadata: metadataOf(rootLabel, projection.metadata),
  });
};

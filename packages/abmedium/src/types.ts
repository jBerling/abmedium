import {
  simName,
  symName,
  seqName,
  disName,
  strName,
  nilName,
  numName,
  refName,
} from "./constants";

export type Nil = null;
export type Str = string;
export type Num = number;
export type Sim = [typeof simName, NodeValue[]];
export type Dis = [
  typeof disName,
  {
    expected: NodeValue | undefined;
    actual: NodeValue | undefined;
    to: NodeValue;
  }
];
export type Sym = [typeof symName, string];
export type Ref = [typeof refName, Label];
export type Seq = [typeof seqName, Array<Label>];
export type Scalar = Nil | Str | Num | Sym | Ref;
export type CompoundValue = Sim | Dis | Seq;
export type NodeValue = Scalar | CompoundValue;

export type NodeValueType =
  | typeof symName
  | typeof simName
  | typeof seqName
  | typeof strName
  | typeof nilName
  | typeof numName
  | typeof disName
  | typeof refName;

export type Label = string | number;

export type Metadata = Record<Label, NodeValue | undefined>;

export type Node<M extends Metadata> = {
  label: Label;
  tracked?: NodeValue;
  value: NodeValue;
  metadata?: M;
};

export type Layer<M extends Metadata> = {
  label: Label;
  nodes: Record<Label, Node<M>>;
};

export type LayerComposition = {
  label: Label;
  layers?: LayerComposition[];
};

export type Document<M extends Metadata> = {
  compositions: Record<Label, LayerComposition>;
  layers: Record<Label, Layer<M>>;
};

export type ProjectionNode<M extends Metadata> = Node<M> & {
  disagreement?: Dis;
  simultaneities?: Sim;
};

export type Projection<M extends Metadata> = {
  nodes: Record<Label, ProjectionNode<M>>;
};

export type PresentationNode<M extends Metadata, R> = ProjectionNode<M> & {
  items?: R[];
  parent?: Label;
  pos?: number;
};

export type NodePresenter<M extends Metadata, R> = (
  node: PresentationNode<M, R>
) => R;

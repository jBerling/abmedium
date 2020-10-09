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

export type ActorId = string;

export type Metadata = Record<Label, NodeValue | undefined>;

export type Node<M extends Metadata, T extends NodeValue = NodeValue> = {
  label: Label;
  tracked?: NodeValue;
  value: T;
  // TODO
  // type: "number" | "text" | "string" | "symbol" | "seq";
  metadata: M;
};

/*

const symbolNode = {
  label: 1,
  value: "+",
  type: "symbol",
  metadata: {}
}

or 

const symbolNode = sym(1, "+")



*/

export type Layer<M extends Metadata, T extends NodeValue = NodeValue> = Record<
  Label,
  Node<M, T>
>;

export type LayerComposition = {
  label: Label;
  layers?: LayerComposition[];
};

export type Document<M extends Metadata, T extends NodeValue = NodeValue> = {
  compositions: Record<Label, LayerComposition>;
  layers: Record<Label, Layer<M, T>>;
};

export type ProjectionNode<
  M extends Metadata,
  T extends NodeValue = NodeValue
> = Node<M, T> & {
  disagreement?: Dis;
  simultaneities?: Record<ActorId, Partial<Node<M, T>>>;
};

export type Projection<M extends Metadata, T extends NodeValue = NodeValue> = {
  nodes: Record<Label, ProjectionNode<M, T>>;
  simultaneities?: Record<ActorId, Partial<Node<M>>>;
};

export type PresentationNode<
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
> = ProjectionNode<M, T> & {
  items?: R[];
  parent?: Label;
  pos?: number;
};

export type NodePresenter<
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
> = (node: PresentationNode<M, R, T>) => R;

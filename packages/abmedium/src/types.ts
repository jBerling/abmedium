import {
  symName,
  seqName,
  strName,
  nilName,
  numName,
  refName,
} from "./constants";

export type Label = string | number;

export type ActorId = string;

export type Nil = { type: typeof nilName; value: null };
export type Num = { type: typeof numName; value: number };
export type Ref = { type: typeof refName; value: Label };
export type Seq = { type: typeof seqName; value: Array<Label> };
export type Str = { type: typeof strName; value: string };
export type Sym = { type: typeof symName; value: string };

export type Scalar = Nil | Num | Ref | Str | Sym;
export type NodeValue = Scalar | Seq;

export type NodeValueType =
  | typeof nilName
  | typeof numName
  | typeof refName
  | typeof seqName
  | typeof strName
  | typeof symName;

export type Disagreement<M extends Metadata> = {
  expected?: NodeValue;
  actual?: NodeValue;
  to?: NodeValue;
  metadata?: {
    expected: Partial<M>;
    actual: Partial<M>;
    to: Partial<M>;
  };
};

export type Metadata = Record<Label, NodeValue | undefined>;

export type Node<M extends Metadata, T extends NodeValue = NodeValue> = {
  metadata: M;
  label: Label;
  tracked?: NodeValue;
  trackedMeta?: Partial<M>;
} & T;

export type Layer<M extends Metadata> = Record<Label, Node<M>>;

export type LayerComposition = {
  label: Label;
  layers?: LayerComposition[];
};

export type Document<M extends Metadata> = {
  compositions: Record<Label, LayerComposition>;
  layers: Record<Label, Layer<M>>;
};

export type ProjNode<
  M extends Metadata,
  T extends NodeValue = NodeValue
> = Node<M> & {
  disagreements?: Record<Label, Partial<Node<M, T>>>;
  simultaneities?: Record<ActorId, Partial<Node<M, T>>>;
};

export type Projection<M extends Metadata, T extends NodeValue = NodeValue> = {
  nodes: Record<Label, ProjNode<M, T>>;
  simultaneities?: Record<Label, Record<ActorId, Partial<Node<M, T>>>>;
};

export type PresNode<
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
> = ProjNode<M, T> & {
  items?: R[];
  parent?: Label;
  pos?: number;
};

export type NodePresenter<
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
> = (
  node: PresNode<M, R, T>,
  items?: R[],
  simultaneities?: Record<ActorId, Partial<Node<M, T>>>
) => R;

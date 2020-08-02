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

type LayerRecord<T> = Record<Label, T | SubLayerRecord<T>>;
export interface SubLayerRecord<T> extends LayerRecord<T> {}
export type Layer = LayerRecord<NodeValue>;

export type Metalayer = Record<Label, NodeValue>;

export type LayerWithSublayers = [Label, ViewStack];

export type ViewStack = (Label | LayerWithSublayers)[];

export type Projection = {
  nodes: Record<Label, NodeValue>;
  metadata: Record<Label, Metalayer>;
  simultaneities: Record<Label, Sim>;
  disagreements: Record<Label, Dis>;
};

export type PresentationNode<R = Scalar> = {
  value: NodeValue;
  items?: R[];
  label: Label;
  parent?: Label;
  pos?: number;
  dis?: NodeValue;
  sim?: NodeValue;
  metadata: Record<string, NodeValue>;
  disagreement?: {
    expected?: NodeValue;
    actual?: NodeValue;
    to: NodeValue;
  };
  simultaneities?: NodeValue[];
};

export type NodePresenter<R = Scalar> = (node: PresentationNode<R>) => R;

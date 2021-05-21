import { Text } from "automerge";

import {
  Label,
  NodeValue,
  NodeValueType,
  Layer,
  Node,
  Str,
  Num,
  Sym,
  Seq,
  Nil,
  Ref,
  Txt,
  Metadata,
} from "./types";

import {
  symName,
  seqName,
  strName,
  numName,
  nilName,
  refName,
  txtName,
} from "./constants";

import { valswitch } from "./valswitch";

export const layer = <M extends Metadata>(
  nodes: Record<Label, Node<M>> = {}
): Layer<M> => nodes;

export const valtype = ({ type }: NodeValue): NodeValueType => type;

export const valtypeIn = (
  n: NodeValue,
  ...types: NodeValueType[]
): NodeValueType | undefined => {
  const nt = valtype(n);
  for (const vtype of types) {
    if (vtype === nt) return nt;
  }
  return undefined;
};

export const node = <M extends Metadata, T extends NodeValue>(
  label: Label,
  value: T,
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, T> => {
  let node: Node<M, T> = { ...value, label, metadata };

  // We handle tracked this way,
  // because Automerge seems to not support undefined.
  if (tracked) node.tracked = tracked;
  if (trackedMeta) node.trackedMeta = trackedMeta;

  return node;
};

export const nodeValueOf = <T extends NodeValue>({
  type,
  value,
}: Node<any, T>): T => ({ type, value } as T);

export const nil: Nil = { type: nilName, value: null };

export const niln = <M extends Metadata>(
  label: Label,
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Nil> => node(label, nil, metadata, tracked, trackedMeta);

export const num = (x: string | number): Num => ({
  type: numName,
  value: typeof x === "string" ? Number(x) : x,
});

export const numn = <M extends Metadata>(
  label: Label,
  value: Num["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Num> => node(label, num(value), metadata, tracked, trackedMeta);

export const ref = (value: Ref["value"]): Ref => ({ type: refName, value });

export const refn = <M extends Metadata>(
  label: Label,
  value: Ref["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Ref> => node(label, ref(value), metadata, tracked, trackedMeta);

export const seq = (value: Seq["value"] = []): Seq => ({
  type: seqName,
  value,
});

export const seqn = <M extends Metadata>(
  label: Label,
  value: Seq["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Seq> => node(label, seq(value), metadata, tracked, trackedMeta);

export const str = (value: Str["value"]): Str => ({ type: strName, value });

export const strn = <M extends Metadata>(
  label: Label,
  value: Str["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Str> => node(label, str(value), metadata, tracked, trackedMeta);

export const sym = (name: string): Sym => ({ type: symName, value: name });

export const symn = <M extends Metadata>(
  label: Label,
  value: Sym["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Sym> => node(label, sym(value), metadata, tracked, trackedMeta);

export const txt = (value: Text): Txt => ({ type: txtName, value });

export const txtn = <M extends Metadata>(
  label: Label,
  value: Txt["value"],
  metadata: M,
  tracked?: NodeValue,
  trackedMeta?: Partial<M>
): Node<M, Txt> => {
  let val = txt(value);
  return node(label, val, metadata, tracked, trackedMeta);
};

export const lengthOf = (value) =>
  valswitch<number>({
    seq: (v) => v.length,
    sym: (v) => v.length,
    str: (v) => v.length,
    txt: (v) => v.length,
    num: (v) => String(v).length,
    ref: NaN,
    nil: 0,
  })(value);

export const isEqual = (a: NodeValue | undefined, b: NodeValue | undefined) => {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  return valswitch<boolean>({
    [seqName]: (aVal) => {
      const bSeq = b as Seq;
      if (!bSeq || aVal.length !== bSeq.value.length) return false;

      for (const [i, aItem] of aVal.entries()) {
        if (aItem !== bSeq.value[i]) return false;
      }
      return true;
    },

    [refName]: (aVal) => b.type === refName && String(aVal) === String(b.value),

    [txtName]: (aVal) =>
      b.type === txtName && aVal.toString() === b.value.toString(),

    _: () => a.type === b.type && a.value === b.value,
  })(a);
};

import {
  Label,
  NodeValue,
  NodeValueType,
  Layer,
  Node,
  Str,
  Num,
  Sim,
  Dis,
  Sym,
  Seq,
  Nil,
  Scalar,
  Ref,
  Metadata,
} from "./types";

import {
  disName,
  simName,
  symName,
  seqName,
  strName,
  numName,
  nilName,
  refName,
  scalarTypeNames,
  metaPrefix,
} from "./constants";

import { valswitch } from "./valswitch";

// TODO: remove?
export const asLayer = <M extends Metadata>(x: any): Layer<M> | undefined =>
  x !== null && !Array.isArray(x) && typeof x === "object"
    ? (x as Layer<M>)
    : undefined;

export const layer = <M extends Metadata>(
  label: Label,
  nodes: Record<Label, Node<M>> = {}
): Layer<M> => ({ label, nodes });

// TODO: remove?
export const isMetalayerLabel = (label: Label): boolean =>
  String(label).startsWith(metaPrefix);

export const valtype = (v: NodeValue): NodeValueType | null => {
  if (typeof v === "string") return strName;
  if (typeof v === "number") return numName;
  if (v === null) return nilName;
  if (Array.isArray(v)) {
    const [type] = v as any;
    return type;
  }

  // Not an Abmedium value type
  return null;
};

export const valtypeIn = (
  v: NodeValue,
  ...types: NodeValueType[]
): NodeValueType | undefined => {
  const vt = valtype(v);
  for (const vtype of types) {
    if (vtype === vt) return vt;
  }
  return undefined;
};

export const asScalar = (x: any): Scalar | undefined =>
  valtypeIn(x, ...scalarTypeNames) ? (x as Scalar) : undefined;

export const sim = (...members: NodeValue[]): Sim => {
  const s = new Set<NodeValue>();

  const swtch = valswitch({
    sim: ([, values]) => {
      for (const v of values) s.add(v);
    },
    _: (v) => {
      s.add(v);
    },
  });

  for (const member of members) swtch(member);

  return [simName, [...s.values()]];
};

export const asSim = (v: any): Sim | undefined => valtypeIn(v, "sim") && v;

export const dis = (args: {
  expected: NodeValue | undefined;
  actual: NodeValue | undefined;
  to: NodeValue;
}): Dis => [disName, args];

export const asDis = (v: any): Dis | undefined =>
  valtypeIn(v, disName) && (v as Dis);

export const sym = (name: string): Sym => [symName, name];

export const asSym = (v: any): Sym | undefined =>
  valtypeIn(v, symName) && (v as Sym);

export const ref = (label: Label): Ref => [refName, label];

export const asRef = (v: any): Ref | undefined =>
  valtypeIn(v, refName) && (v as Ref);

export const str = (s: string): Str => s;

export const asStr = (v: any): Str | undefined =>
  valtypeIn(v, strName) && (v as Str);

export const num = (x: string | number): Num =>
  typeof x === "string" ? Number(x) : x;

export const asNum = (v: any): Num | undefined =>
  valtypeIn(v, numName) && (v as Num);

export const seq = (...items: Label[]): Seq => [seqName, items];

export const seqItems = (s: Seq) => s[1];

export const asSeq = (v: any): Seq | undefined =>
  valtypeIn(v, seqName) && (v as Seq);

export const nil: Nil = null;

export const lengthOf = (value) =>
  valswitch<number>({
    seq: ([, s]) => s.length,
    sym: ([, name]) => name.length,
    str: (s) => s.length,
    num: (n) => String(n).length,
    sim: NaN,
    dis: NaN,
    ref: NaN,
    nil: 0,
  })(value);

export const isEqual = (a: NodeValue | undefined, b: NodeValue | undefined) => {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  return valswitch<boolean>({
    sym: ([, aName]) => {
      const [, bName] = asSym(b) || [];
      return aName === bName;
    },

    ref: ([, aLabel]) => {
      const [, bLabel] = asRef(b) || [];
      return String(aLabel) === String(bLabel);
    },

    seq: ([, aItems]) => {
      const bSeq = asSeq(b);
      if (!bSeq || aItems.length !== bSeq[1].length) return false;
      for (const [i, aItem] of aItems.entries()) {
        if (aItem !== bSeq[1][i]) return false;
      }
      return true;
    },

    sim: ([, aItems]) => {
      const bSim = asSim(b);
      if (!bSim || aItems.length !== bSim[1].length) return false;
      for (const aItem of aItems) {
        if (!bSim[1].find((bItem) => isEqual(aItem, bItem))) {
          return false;
        }
      }
      return true;
    },

    dis: ([, { actual: aActual, to: aTo, expected: aExpected }]) => {
      const bDis = asDis(b);
      if (!bDis) return false;
      const [, { actual: bActual, to: bTo, expected: bExpected }] = bDis;

      return (
        isEqual(aActual, bActual) &&
        isEqual(aTo, bTo) &&
        isEqual(aExpected, bExpected)
      );
    },

    _: () => a === b,
  })(a);
};

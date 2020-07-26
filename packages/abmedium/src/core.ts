export type Handle = string;
export type Value = any; // TODO, type this fucker
export type Nodes = Record<Handle, Value>;

export const LAYER = "__layer__";
export type Layer = {
  [LAYER]: true;
} & Nodes;
export const isLayer = (v: any): boolean => v !== null && Boolean(v[LAYER]);
export const layer = (nodes: Nodes = {}): Layer => ({
  ...nodes,
  [LAYER]: true,
});

export const DOCUMENT = "__document__";
export type Document = { [DOCUMENT]: true } & Layer;
export const isDocument = (v) => v !== null && Boolean(v[DOCUMENT]);
export const abDocument = (nodes: Nodes = {}): Document => ({
  ...nodes,
  [DOCUMENT]: true,
  [LAYER]: true,
});

// TODO: break up into several functions
export const valtype = (v: Value, flag?, ...flags) => {
  const vt = valtype.vtype(v);
  if (!flag) return vt;
  if (typeof flag === "string") {
    return [...flags, flag].includes(vt);
  }
  if (typeof flag === "object") {
    const handler = flag[vt] !== undefined ? flag[vt] : flag._;
    if (handler === undefined) {
      throw new Error("no _ or " + vt + " handler");
    }
    return typeof handler === "function" ? handler(v) : handler;
  }
  throw new Error("unknown flag");
};

valtype.vtype = (v) => {
  if (typeof v === "string") return "str";
  if (typeof v === "number") return "num";
  if (v === null) return "nil";
  if (Array.isArray(v)) {
    const [type] = v;
    return type;
  }
  // Not an Abmedium value type
  return "none";
};

export const sim = (...members) => {
  const s = new Set();
  for (const member of members) {
    valtype(member, {
      sim: ([, values]) => {
        for (const v of values) s.add(v);
      },
      _: () => {
        s.add(member);
      },
    });
  }
  return ["sim", [...s.values()]];
};
export const disagreement = (expected, actual, to) => [
  "dis",
  { expected, actual, to },
];
export const sym = (name) => ["sym", name];
export const str = (s) => s;
export const num = (x) => (typeof x === "string" ? Number(x) : x);
export const seq = (...items) => ["seq", items];
export const seqItems = (s) => {
  if (!valtype(s, "seq")) {
    throw new Error("not a seq");
  }
  return s[1];
};
export const mapping = (to, from) => ["mapping", { from, to }];
export const nil = null;

export const lengthOf = (v) =>
  valtype(v, {
    seq: ([, s]) => s.length,
    sym: ([, name]) => name.length,
    str: (s) => s.length,
    num: (n) => String(n).length,
    sim: NaN,
    dis: NaN,
    nil: 0,
    mapping: NaN,
    _: (x) => {
      let xStr;
      try {
        xStr = JSON.stringify(x);
      } catch (err) {
        xStr = x;
      }
      throw new Error("Not a valid Abmedium value: " + xStr);
    },
  });

export const editvalOf = (value) =>
  valtype(value, {
    str: () => value,
    num: () => String(value),
    nil: () => "",
    _: ([, v]) => v,
  });

export const isEqual = (a, b) =>
  valtype(a, {
    sym: () => valtype(b, "sym") && a[1] === b[1],
    seq: () => {
      if (!valtype(b, "seq") || a.length !== b.length) {
        return false;
      }
      for (const [i, aItem] of a[1].entries()) {
        if (!isEqual(aItem, b[1][i])) return false;
      }
      return true;
    },
    sim: () => {
      if (!valtype(b, "sim") || a[1].length !== b[1].length) return false;

      for (const aItem of a[1]) {
        if (!b[1].find((bItem) => isEqual(aItem, bItem))) {
          return false;
        }
      }
      return true;
    },
    dis: () =>
      valtype(b, "dis") &&
      isEqual(a[1].from, b[1].from) &&
      isEqual(a[1].to, b[1].to) &&
      isEqual(a[1].expected, b[1].expected),
    _: () => a === b,
    mapping: () =>
      valtype(b, "mapping") &&
      isEqual(a[1].from, b[1].from) &&
      isEqual(a[1].to, b[1].to),
  });

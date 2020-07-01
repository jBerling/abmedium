const LAYER = '__layer__';
const isLayer = v => v !== null && Boolean(v[LAYER]);
const layer = (content = {}) => {
  content[LAYER] = true;
  return content;
};

const DOCUMENT = '__document__';
const isDocument = v => v !== null && Boolean(v[DOCUMENT]);
const document = (content = {}) => {
  content[DOCUMENT] = true;
  content[LAYER] = true;
  return content;
};

const valtype = (v, flag, ...flags) => {
  const vt = valtype.vtype(v);
  if (!flag) return vt;
  if (typeof flag === 'string') {
    return [...flags, flag].includes(vt);
  }
  if (typeof flag === 'object') {
    const handler = flag[vt] !== undefined ? flag[vt] : flag._;
    if (handler === undefined) {
      throw new Error('no _ or ' + vt + ' handler');
    }
    return typeof handler === 'function' ? handler(v) : handler;
  }
  throw new Error('unknown flag', flag);
};

valtype.vtype = v => {
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return 'num';
  if (v === null) return 'nil';
  if (Array.isArray(v)) {
    const [type] = v;
    return type;
  }
  // Not an Abmedium value type
  return 'none';
};

const sim = (...members) => {
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
  return ['sim', [...s.values()]];
};
const disagreement = (expected, actual, to) => [
  'dis',
  { expected, actual, to },
];
const sym = name => ['sym', name];
const str = s => s;
const num = x => (typeof x === 'string' ? Number(x) : x);
const seq = (...items) => ['seq', items];
const seqItems = s => {
  if (!valtype(s, 'seq')) {
    throw new Error('not a seq');
  }
  return s[1];
};
const mapping = (to, from) => ['mapping', { from, to }];
const nil = null;

const lengthOf = v =>
  valtype(v, {
    seq: ([, s]) => s.length,
    sym: ([, name]) => name.length,
    str: s => s.length,
    num: n => String(n).length,
    sim: NaN,
    dis: NaN,
    nil: 0,
    mapping: NaN,
    _: x => {
      let xStr;
      try {
        xStr = JSON.stringify(x);
      } catch (err) {
        xStr = x;
      }
      throw new Error('Not a valid Abmedium value: ' + xStr);
    },
  });

const editvalOf = value =>
  valtype(value, {
    str: () => value,
    num: () => String(value),
    nil: () => '',
    _: ([, v]) => v,
  });

const isEqual = (a, b) =>
  valtype(a, {
    sym: () => valtype(b, 'sym') && a[1] === b[1],
    seq: () => {
      if (!valtype(b, 'seq') || a.length !== b.length) {
        return false;
      }
      for (const [i, aItem] of a[1].entries()) {
        if (!isEqual(aItem, b[1][i])) return false;
      }
      return true;
    },
    sim: () => {
      if (!valtype(b, 'sim') || a[1].length !== b[1].length) return false;

      for (const aItem of a[1]) {
        if (!b[1].find(bItem => isEqual(aItem, bItem))) {
          return false;
        }
      }
      return true;
    },
    dis: () =>
      valtype(b, 'dis') &&
      isEqual(a[1].from, b[1].from) &&
      isEqual(a[1].to, b[1].to) &&
      isEqual(a[1].expected, b[1].expected),
    _: () => a === b,
    mapping: () =>
      valtype(b, 'mapping') &&
      isEqual(a[1].from, b[1].from) &&
      isEqual(a[1].to, b[1].to),
  });

module.exports = {
  LAYER,
  layer,
  isLayer,
  DOCUMENT,
  document,
  isDocument,
  disagreement,
  sym,
  sim,
  str,
  num,
  seq,
  seqItems,
  nil,
  mapping,
  valtype,
  lengthOf,
  editvalOf,
  isEqual,
};

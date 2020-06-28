const LAYER = '__layer__'; // Symbol('abmedium/layer');
const isLayer = v => v !== null && Boolean(v[LAYER]);
const layer = (content = {}) => {
  content[LAYER] = true;
  return content;
};

const DOCUMENT = '__document__'; // Symbol('abmedium/document');
const isDocument = v => v !== null && Boolean(v[DOCUMENT]);
const document = (content = {}) => {
  content[DOCUMENT] = true;
  content[LAYER] = true;
  return content;
};

const vtype = v => {
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

const valtype = (v, flag, ...flags) => {
  const vt = vtype(v);
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
const mapping = (from, to) => ['mapping', { from, to }];
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

const equal = (a, b) => {
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    const max = a.length;
    for (let i = 0; i < max; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  if (valtype(a, 'sym')) return a.name === b.name;

  return a === b;
};

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
  equal,
};

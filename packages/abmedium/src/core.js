const LAYER = Symbol('abmedium/layer');
const isLayer = v => v !== null && Boolean(v[LAYER]);
const layer = (content = {}) => {
  content[LAYER] = true;
  return content;
};

const DOCUMENT = Symbol('abmedium/document');
const isDocument = v => v !== null && Boolean(v[DOCUMENT]);
const document = (content = {}) => {
  content[DOCUMENT] = true;
  content[LAYER] = true;
  return content;
};
class Sym {
  constructor(name) {
    this.name = name;
  }
}

function Disagreement(expected, actual, to) {
  Object.assign(this, { expected, actual, to });
}

const isDisagreement = x => x instanceof Disagreement;

function Mapping(from, to) {
  this.from = from;
  this.to = to;
}

const vtype = v => {
  if (v instanceof Sym) return 'sym';
  if (Array.isArray(v)) return 'seq';
  if (typeof v === 'string') return 'str';
  if (typeof v === 'number') return 'num';
  if (v instanceof Set) return 'sim';
  if (v instanceof Disagreement) return 'dis';
  if (v instanceof Mapping) return 'map';
  if (v === null) return 'nil';

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
      sim: () => {
        for (const [m] of member.entries()) {
          s.add(m);
        }
      },
      _: () => s.add(member),
    });
  }
  return s;
};
const disagreement = (expected, actual, to) =>
  new Disagreement(expected, actual, to);
const sym = name => new Sym(name);
const str = s => s;
const num = x => (typeof x === 'string' ? Number(x) : x);
const seq = (...items) => items;
const mapping = (from, to) => new Mapping(from, to);
const nil = null;

const lengthOf = v =>
  valtype(v, {
    seq: s => s.length,
    sym: ({ name }) => name.length,
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
    sym: () => value.name,
    num: () => String(value),
    nil: () => '',
    _: value,
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

  if (valtype(a) === 'sym') return a.name === b.name;

  return a === b;
};

module.exports = {
  layer,
  isLayer,
  document,
  isDocument,
  disagreement,
  isDisagreement,
  sym,
  sim,
  str,
  num,
  seq,
  nil,
  mapping,
  valtype,
  lengthOf,
  editvalOf,
  equal,
};

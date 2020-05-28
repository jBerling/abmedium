const LAYER = Symbol('layer');
const DOCUMENT = Symbol('document');

const isLayer = v => v !== null && Boolean(v[LAYER]);
const layer = (content = {}) => ({ ...content, [LAYER]: true });

const root = 0;

const sim = members => new Set(members);
const str = s => s;
const num = x => (typeof x === 'string' ? Number(x) : x);
const seq = items => (Array.isArray(items) ? items : [...items]);
const nil = null;

class Sym {
  constructor(name) {
    this.name = name;
  }
}
const sym = name => new Sym(name);

const assertValidHandle = handle => {
  if (typeof handle !== 'string' && typeof handle !== 'number') {
    throw new Error(`»${handle}« is not a valid handle`);
  }
};

function Disagreement(expected, actual, to) {
  Object.assign(this, { expected, actual, to });
}
const disagreement = (expected, actual, to) =>
  new Disagreement(expected, actual, to);

function Mapping(from, to) {
  this.from = from;
  this.to = to;
}

const mapping = (from, to) => new Mapping(from, to);

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

const valueOfSim = set => (set.size < 2 ? set.values().next().value : set);

const valueOf = (doc, handle) => {
  const v = doc[handle];
  if (v === undefined) return undefined;
  if (valtype(v, 'sim')) return valueOfSim(v);
  if (valtype(v, 'sym', 'seq')) return v;
  if (!valtype(v, 'nil', 'map') && typeof v === 'object') {
    v[LAYER] = true;
  }
  return v;
};

const docValue = doc =>
  Object.keys(doc).reduce(
    (acc, handle) => ({
      ...acc,
      [handle]: valueOf(doc, handle),
    }),
    {}
  );

const valueOfLayer = (vOf, layer) => {
  const val = vOf(layer);

  return Object.keys(layer).reduce((acc, handl) => {
    let v;
    if (isLayer(val(handl))) {
      v = valueOfLayer(vOf, val(handl));
    } else v = val(handl);
    // TODO: instead of LAYER, maybe type Layer, like with conflict types
    return { ...acc, [handl]: v, [LAYER]: true };
  }, {});
};

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

const projectValue = (projection, handl, newVal) => {
  if (!valtype(newVal, 'map')) {
    projection[handl] = newVal;
    return;
  }

  const oldVal = projection[handl];
  if (oldVal === undefined) {
    projection[handl] = newVal.to;
    return;
  }

  if (!equal(oldVal, newVal.from)) {
    projection[handl] = disagreement(newVal.from, oldVal, newVal.to);
  } else {
    projection[handl] = newVal.to;
  }
};

const projectLayer = (projection, layer, stack = [], metalayers = []) => {
  const val = handl => layer[handl];
  for (const handl of Object.keys(layer)) {
    const v = val(handl);
    if (isLayer(v)) continue;
    projectValue(projection, handl, v);
  }
  for (const _stack of stack) {
    const [subLayerName, subStack = []] = Array.isArray(_stack)
      ? _stack
      : [_stack];
    projectLayer(projection, val(subLayerName), subStack, metalayers);
  }
  for (const mlayer of metalayers) {
    const metaValues = layer[mlayer];
    if (!metaValues) continue;
    projection[mlayer] = { ...metaValues, ...(projection[mlayer] || {}) };
  }
  return projection;
};

const proj = (doc, stack = [], metalayers = []) => {
  const projection = {};
  projectLayer(projection, doc.value(), stack, metalayers);
  return projection;
};

const isDocument = x => Boolean(x[DOCUMENT]);

module.exports = {
  DOCUMENT,
  docValue,
  valueOfLayer,
  root,
  sym,
  sim,
  str,
  num,
  seq,
  nil,
  layer,
  LAYER,
  isDocument,
  isLayer,
  valueOf,
  assertValidHandle,
  proj,
  mapping,
  disagreement,
  valtype,
  lengthOf,
  editvalOf,
};

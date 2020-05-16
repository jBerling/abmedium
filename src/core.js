const CRDTs = require('delta-crdts');
const uuid = require('uuid/v1');

const LAYER = Symbol('layer');
const isLayer = v => !!v[LAYER];

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
const disagreement = (...options) => new Disagreement(...options);

function Mapping(from, to) {
  Object.assign(this, { from, to });
}

const mapping = (...options) => new Mapping(...options);

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

const valueOfSim = set => (set.size < 2 ? set.values().next().value : set);

const valueOf = valOfSim => doc => handle => {
  const v = doc[handle];
  if (v === undefined) return v;
  if (valtype(v, 'sim')) return valOfSim(v);
  if (valtype(v, 'sym', 'seq')) return v;
  if (typeof v === 'object') v[LAYER] = true;
  return v;
};

const pres = (docWithMetadata, nodePresenter = v => v) => {
  const doc = {};
  const metalayers = {};

  for (const key of Object.keys(docWithMetadata)) {
    const value = docWithMetadata[key];
    if (isLayer(value)) metalayers[key] = value;
    else doc[key] = value;
  }

  if (!doc[root]) {
    throw new Error(
      'A fragment can not be presented. The document has no root.'
    );
  }

  // todo: what is happening here? A bit complicated?
  // Is it a leftover from the earlier more complicated
  // extension implementation?
  const val = valueOf(valueOfSim)(doc);

  const metaOfNode = (h, parent, pos) =>
    Object.keys(metalayers).reduce(
      (metadata, layer) => ({ ...metadata, [layer]: metalayers[layer][h] }),
      { pos, parent }
    );

  const graph = (v, parent) => {
    if (valtype(v, 'seq')) {
      return v.map((h, pos) =>
        nodePresenter(graph(val(h), h), h, metaOfNode(h, parent, pos))
      );
    }
    return v;
  };

  return nodePresenter(graph(val(root), root), root, metaOfNode(root));
};

const docValue = doc => {
  const val = valueOf(valueOfSim)(doc);

  return Object.keys(doc).reduce(
    (acc, handle) => ({
      ...acc,
      [handle]: val(handle),
    }),
    {}
  );
};

const ORMap = CRDTs('ormap');

const layers = path =>
  Array.isArray(path) ? path.slice(0, path.length - 1) : [];

const layerArgs = layrs =>
  layrs.reduce((args, layer) => args.concat([layer, 'ormap', 'applySub']), []);

const handle = path => (Array.isArray(path) ? path[path.length - 1] : path);

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

class Document {
  constructor(name = uuid()) {
    this.name = name;
    this._ormap = ORMap(name);
  }

  add(path, value, from) {
    const handl = handle(path);
    assertValidHandle(handl);

    return this._ormap.applySub(
      ...layerArgs(layers(path)),
      handl,
      'mvreg',
      'write',
      from !== undefined ? mapping(from, value) : value
    );
  }

  value() {
    return valueOfLayer(valueOf(valueOfSim), docValue(this._ormap.value()));
  }

  sync(deltas) {
    if (!Array.isArray(deltas)) return this._ormap.apply(deltas);
    for (const delta of deltas) {
      this._ormap.apply(delta);
    }
  }
}

const document = name => new Document(name);
const isDocument = x => x instanceof Document;

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

module.exports = {
  Document,
  document,
  isDocument,
  pres,
  root,
  sym,
  sim,
  str,
  num,
  seq,
  nil,
  LAYER,
  isLayer,
  valueOf,
  valueOfSim,
  assertValidHandle,
  proj,
  mapping,
  disagreement,
  valtype,
  lengthOf,
};

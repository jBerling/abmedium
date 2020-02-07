const CRDTs = require('delta-crdts');
const uuid = require('uuid/v1');

const LAYER = Symbol('layer');
const isLayer = v => !!v[LAYER];

const root = 0;

const sim = members => new Set(members);
const isSim = v => v instanceof Set;

class Sym {
  constructor(name) {
    this.name = name;
  }
}
const sym = name => new Sym(name);
const isSym = v => v instanceof Sym;

const assertValidHandle = handle => {
  if (typeof handle !== 'string' && typeof handle !== 'number') {
    throw new Error(`»${handle}« is not a valid handle`);
  }
};

const valueOfSim = set => (set.size < 2 ? set.values().next().value : set);

const valueOf = valOfSim => doc => handle => {
  const v = doc[handle];
  if (v === undefined) return v;
  if (isSim(v)) return valOfSim(v);
  if (isSym(v) || Array.isArray(v)) return v;
  if (typeof v === 'object') {
    v[LAYER] = true;
  }
  return v;
};

const pres = doc => {
  if (!doc[root]) {
    throw new Error(
      'A fragment can not be presented. The document has no root.'
    );
  }

  const val = valueOf(valueOfSim)(doc);

  const graph = v => {
    if (Array.isArray(v)) return v.map(h => graph(val(h)));
    return v;
  };

  return graph(val(root));
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

function Mapping(from, to) {
  Object.assign(this, { from, to });
}

function Disagreement(expected, actual, to) {
  Object.assign(this, { expected, actual, to });
}

const disagreement = (...options) => new Disagreement(...options);

const mapping = (...options) => new Mapping(...options);

const isMapping = x => x instanceof Mapping;

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

const projectValue = (projection, handl, newVal) => {
  if (!isMapping(newVal)) {
    projection[handl] = newVal;
    return;
  }

  const oldVal = projection[handl];

  if (oldVal === undefined) {
    projection[handl] = newVal.to;
    return;
  }

  if (oldVal !== newVal.from) {
    projection[handl] = disagreement(newVal.from, oldVal, newVal.to);
  } else {
    projection[handl] = newVal.to;
  }
};

const projectLayer = (projection, layer, stack = []) => {
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
    projectLayer(projection, val(subLayerName), subStack);
  }
  return projection;
};

const proj = (doc, stack = []) => {
  const projection = {};
  projectLayer(projection, doc.value(), stack);
  return projection;
};

module.exports = {
  Document,
  document,
  isDocument,
  pres,
  root,
  sym,
  isSym,
  sim,
  isSim,
  LAYER,
  isLayer,
  valueOf,
  valueOfSim,
  assertValidHandle,
  proj,
  mapping,
  disagreement,
};

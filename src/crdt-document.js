const {
  assertValidHandle,
  handle,
  mapping,
  valueOf,
  valueOfLayer,
  valueOfSim,
  docValue,
  DOCUMENT,
} = require('./core');

const CRDTs = require('delta-crdts');

const ORMap = CRDTs('ormap');

const layers = path =>
  Array.isArray(path) ? path.slice(0, path.length - 1) : [];

const layerArgs = layrs =>
  layrs.reduce((args, layer) => args.concat([layer, 'ormap', 'applySub']), []);

const req = prop => {
  throw new Error(prop + ' is required');
};
class CRDTDocument {
  constructor(name = req('name')) {
    this[DOCUMENT] = true;
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

const document = name => new CRDTDocument(name);

module.exports = { document };

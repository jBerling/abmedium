const {
  assertValidHandle,
  handle,
  mapping,
  valueOf,
  valueOfLayer,
  valueOfSim,
  docValue,
  DOCUMENT,
  LAYER,
} = require('./core');

const { addInLayer } = require('./util');

const layers = path =>
  Array.isArray(path) ? path.slice(0, path.length - 1) : [];

const req = prop => {
  throw new Error(prop + ' is required');
};
class Document {
  constructor(name = req('name')) {
    this[DOCUMENT] = true;
    this.name = name;
    this.content = { [LAYER]: true };
  }

  add(path, value, from) {
    const handl = handle(path);
    assertValidHandle(handl);
    addInLayer(
      this.content,
      [...layers(path), handl],
      from != undefined ? mapping(from, value) : value
    );
  }

  value() {
    return valueOfLayer(valueOf(valueOfSim), docValue(this.content));
  }

  sync(deltas) {
    if (!Array.isArray(deltas)) return this._ormap.apply(deltas);
    for (const delta of deltas) {
      this._ormap.apply(delta);
    }
  }
}

const document = name => new Document(name);

module.exports = { document };

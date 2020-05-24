const {
  assertValidHandle,
  mapping,
  valueOf,
  valueOfLayer,
  docValue,
  DOCUMENT,
  LAYER,
} = require('./core');

const handle = path => (Array.isArray(path) ? path[path.length - 1] : path);

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
    return valueOfLayer(
      doc => value => valueOf(doc, value),
      docValue(this.content)
    );
  }
}

const document = name => new Document(name);

module.exports = { document };

const {
  assertValidHandle,
  mapping,
  valueOf,
  valueOfLayer,
  docValue,
  DOCUMENT,
  isLayer,
  layer: l,
} = require('./core');

const handle = path => (Array.isArray(path) ? path[path.length - 1] : path);

const { addInLayer } = require('./util');

const { merged, replaced } = require('./combining');

const layers = path =>
  Array.isArray(path) ? path.slice(0, path.length - 1) : [];

const req = prop => {
  throw new Error(prop + ' is required');
};
class Document {
  constructor(name = req('name')) {
    this[DOCUMENT] = true;
    this.name = name;
    this.content = l({});
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

  replace(overlay) {
    if (!isLayer(overlay)) {
      throw new Error('replace expects a layer.');
    }

    replaced(this.content, overlay);
  }

  merge(layer) {
    if (!isLayer(layer)) {
      throw new Error('merge expects a layer.');
    }

    merged(this.content, layer);
  }

  value() {
    return valueOfLayer(
      doc => value => valueOf(doc, value),
      docValue(this.content)
    );
  }
}

module.exports = name => new Document(name);

const { isSym, sym, isSim, sim, document, isDocument } = require('./core');

const serialized = (x, humanized) => {
  const replacer = (_, value) => {
    if (isSim(value)) {
      return { __SIM__: Array.from(value) };
    }

    if (isSym(value)) {
      return { __SYM__: value.name };
    }

    if (value instanceof Map) {
      return { __MAP__: Array.from(value) };
    }

    return value;
  };

  if (isDocument(x)) {
    return JSON.stringify(
      { __DOC__: { name: x.name, state: x._ormap.state() } },
      replacer,
      humanized ? 2 : undefined
    );
  }

  return JSON.stringify(x, replacer, humanized ? 2 : undefined);
};

const deserialized = code => {
  const reviver = (_, value) => {
    if (value && typeof value === 'object') {
      const { __SIM__, __SYM__, __MAP__ } = value;
      if (__SIM__) return sim(__SIM__);
      if (__SYM__) return sym(__SYM__);
      if (__MAP__) return new Map(__MAP__);
    }

    return value;
  };

  const rawObject = JSON.parse(code, reviver);

  if (rawObject.__DOC__) {
    const doc = document(rawObject.__DOC__.name);
    doc.sync(rawObject.__DOC__.state);
    return doc;
  }

  return rawObject;
};

module.exports = { serialized, deserialized };

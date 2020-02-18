const { isSym, sym, isSim, sim, document } = require('./core');

const serialized = (doc, humanized) => {
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

  return JSON.stringify(
    { name: doc.name, state: doc._ormap.state() },
    replacer,
    humanized ? 2 : undefined
  );
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

  const doc = document(rawObject.name);

  doc.sync(rawObject.state);

  return doc;
};

module.exports = { serialized, deserialized };

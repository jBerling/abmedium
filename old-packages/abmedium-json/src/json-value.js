const {
  valtype,
  sim,
  sym,
  mapping,
  isLayer,
  layer,
} = require('@abrovink/abmedium');

const sim_ = '$$S',
  sym_ = '$$s',
  map_ = '$$m',
  layer_ = '$$l';

const jsonOf = (docValue, humanized) => {
  const replacer = (_, value) => {
    if (valtype(value, 'sim')) {
      return { [sim_]: Array.from(value) };
    }

    if (valtype(value, 'sym')) {
      return { [sym_]: value.name };
    }

    if (valtype(value, 'map')) {
      return { [map_]: [value.from, value.to] };
    }

    if (isLayer(value)) {
      return { ...value, [layer_]: true };
    }

    return value;
  };

  return JSON.stringify(docValue, replacer, humanized ? 2 : undefined);
};

const fromJson = docValue => {
  const reviver = (_, value) => {
    if (value && typeof value === 'object') {
      const { [sim_]: _sim, [sym_]: _sym, [map_]: _map } = value;

      if (_sim) return sim(_sim);
      if (_sym) return sym(_sym);
      if (_map) {
        return mapping(..._map);
      }
    }

    if (value && value[layer_]) {
      value[layer_] = undefined;
      return layer(value);
    }

    return value;
  };

  const rawObject = JSON.parse(docValue, reviver);

  return rawObject;
};

module.exports = { jsonOf, fromJson };

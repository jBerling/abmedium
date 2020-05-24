const { LAYER } = require('./core');

const addIn = (o, path, v) => {
  let _o = o,
    i = 0,
    l = path.length;

  for (const prop of path) {
    i += 1;
    if (i < l) {
      if (_o[prop] === undefined) _o[prop] = {};
      _o = _o[prop];
    } else {
      _o[prop] = v;
    }
  }

  return o;
};

const addInLayer = (o, path, v) => {
  let _o = o,
    i = 0,
    l = path.length;

  for (const prop of path) {
    i += 1;
    if (i < l) {
      if (_o[prop] === undefined) _o[prop] = { [LAYER]: true };
      _o = _o[prop];
    } else {
      _o[prop] = v;
    }
  }

  return o;
};

module.exports = { addIn, addInLayer };

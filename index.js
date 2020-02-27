const {
  proj,
  mapping,
  disagreement,
  document,
  root,
  sym,
  pres,
  isSequence,
  isSym,
} = require('./src/core');

const { serialized, deserialized } = require('./src/serialization');

module.exports = {
  proj,
  mapping,
  disagreement,
  document,
  root,
  sym,
  pres,
  serialized,
  deserialized,
  isSequence,
  isSym,
};

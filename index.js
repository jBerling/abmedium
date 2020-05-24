const {
  proj,
  mapping,
  disagreement,
  isDisagreement,
  root,
  sym,
  str,
  num,
  seq,
  nil,
  valtype,
  valueOf,
  lengthOf,
  editvalOf,
  assertValidHandle,
  layer,
  isLayer,
} = require('./src/core');

const document = require('./src/document');
const treeOf = require('./src/tree-of');

module.exports = {
  proj,
  mapping,
  disagreement,
  isDisagreement,
  root,
  sym,
  str,
  num,
  seq,
  nil,
  valtype,
  valueOf,
  lengthOf,
  editvalOf,
  assertValidHandle,
  layer,
  isLayer,

  document,
  treeOf,
};

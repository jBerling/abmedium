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
  lengthOf,
  editvalOf,
  assertValidHandle,
  layer,
  isLayer,
} = require('./src/core');

const document = require('./src/document');
const treeOf = require('./src/tree-of');
const { combined, merge, replace } = require('./src/combining');

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
  lengthOf,
  editvalOf,
  assertValidHandle,
  layer,
  isLayer,

  document,
  treeOf,

  combined,
  merge,
  replace,
};

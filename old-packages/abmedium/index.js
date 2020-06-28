const {
  proj,
  mapping,
  disagreement,
  isDisagreement,
  root,
  sym,
  sim,
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
const nodes = require('./src/nodes');
const layers = require('./src/layers');
const { combined, merge, replace } = require('./src/combining');

module.exports = {
  proj,
  mapping,
  disagreement,
  isDisagreement,
  root,
  sym,
  sim,
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
  nodes,
  layers,

  combined,
  merge,
  replace,
};

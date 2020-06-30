const core = require('./src/core');

module.exports = core;

const {
  document,
  str,
  seq,
  sym,
  merge,
  treeOf,
  valtype,
  change,
  save,
  getChanges,
} = module.exports;

let doc1 = document({
  h: sym('header'),
  p: sym('paragraph'),
  0: seq(1, 2, 3),
  1: seq('h', 4),
  2: seq('p', 5),
  3: seq('p', 6),
  4: str('About Foo'),
  5: str('Lorem ipsum ...'),
  6: str('Pirum parum ...'),
});

let doc2 = document();

doc2 = merge(doc2, doc1);

doc2 = change(doc2, doc => {
  doc[4] = str('About Foo!');
});

doc1 = change(doc1, doc => {
  doc[4] = str('Foo');
});

doc2 = merge(doc2, doc1);

const {
  document,
  seq,
  num,
  str,
  proj,
  treeOf,
  valtype,
  layer,
  mapping,
} = require('@abrovink/abmedium');

// ## Document Structure

let treedoc = document({
  0: seq(1, 2, 3),
  1: seq(4, 5),
  2: seq(6, 7),
  3: seq(8, 9),
  4: str('apple'),
  5: num(1),
  6: str('banana'),
  7: num(2),
  8: str('pear'),
  9: num(3),
});

const stringPresenter = value =>
  valtype(value, {
    seq: ([, items]) => `[${items.join(', ')}]`,
    str: () => `"${value}"`,
    sym: ([, name]) => name,
    dis: ([, { expected, actual, to }]) => `»${expected} ≠ ${actual} → ${to}«`,
    _: v => v,
  });

let out = treeOf(proj(treedoc), stringPresenter);
console.log('1.', out);
// 1. [["apple", 1], ["banana", 2], ["pear", 3]]

const dagdoc = document({
  0: seq(1, 1),
  1: str('same'),
});

out = treeOf(proj(dagdoc), stringPresenter);
console.log('2.', out);
// 2. ["same", "same"]

// ## Layers and Projections

// translations
treedoc = {
  ...treedoc,
  se: layer({
    4: str('äpple'),
    6: str('banan'),
    8: str('päron'),
  }),
};

out = treeOf(proj(treedoc, ['se']), stringPresenter);
console.log('3.', out);
// 3. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Disagreements and Simultaneities

// translations with mappings
treedoc = {
  ...treedoc,
  se: layer({
    4: mapping(str('äpple'), str('apple')),
    6: mapping(str('banan'), str('banana')),
    8: mapping(str('päron'), str('pear')),
  }),
};

out = treeOf(proj(treedoc, ['se']), stringPresenter);
console.log('4.', out);
// 4. [["äpple", 1], ["banan", 2], ["päron", 3]]

out = treeOf(proj({ ...treedoc, 4: str('lemon') }, ['se']), stringPresenter);
console.log('5.', out);
// 5. [[»"apple" ≠ "lemon" → "äpple"«, 1], ["banan", 2], ["päron", 3]]

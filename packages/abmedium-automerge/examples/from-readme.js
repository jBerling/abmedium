const {
  document,
  seq,
  sym,
  txt,
  num,
  merge,
  treeOf,
  valtype,
  change,
  proj,
} = require('@abrovink/abmedium-automerge');

let docA = document({ 0: seq(1, 2, 3), 1: sym('+'), 2: num(100), 3: num(200) });

let docB = document();

docB = merge(docB, docA);

console.log('1.', docB);
// 1. {
//     '0': [ 'seq', [ 1, 2, 3 ] ],
//     '1': [ 'sym', '+' ],
//     '2': 100,
//     '3': 200
// }

docA = change(docA, doc => {
  doc[2] = 110;
  doc[3] = 220;
});

docB = change(docB, doc => {
  doc[2] = 111;
});

docB = merge(docB, docA);
console.log('2.', docB);

let docC = document({ 0: txt('Hello!') });

console.log(
  '3. ',
  treeOf(proj(docC), value => valtype(value, { txt: () => value.toString() }))
);
// 3. Hello!

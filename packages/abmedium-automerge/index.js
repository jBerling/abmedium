const Automerge = require('automerge');
const Abmedium = require('@abrovink/abmedium');

let abdoc = Abmedium.document({
  0: Abmedium.seq(1, 2, 3),
  1: Abmedium.sym('+'),
  2: Abmedium.num(100),
  3: Abmedium.num(200),
  alt: Abmedium.layer({ 2: Abmedium.num(111) }),
});

console.log(abdoc);

console.log(Abmedium.treeOf(Abmedium.proj(abdoc, ['alt'])));

let doc = Automerge.from(abdoc);

console.log(doc);

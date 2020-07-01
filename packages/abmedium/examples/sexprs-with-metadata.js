const {
  document,
  layer,
  seq,
  sym,
  num,
  treeOf,
  valtype,
} = require('@abrovink/abmedium');

// A simple example expression
let doc = document({
  0: seq(1, 2, 3),
  1: sym('*'),
  2: num(2),
  3: seq(4, 5, 6),
  4: sym('+'),
  5: num(3),
  6: num(4),
});

// A "node presenter" that returns the document as a string
const sexpr = value =>
  valtype(value, {
    sym: ([, name]) => name,
    seq: ([, items]) => `(${items.join(' ')})`,
    _: v => v,
  });

console.log(treeOf(doc, sexpr));
// (* 2 (+ 3 4))

// Add type information in a metalayer
doc = document({
  ...doc,
  type: layer({
    0: sym('list'),
    1: sym('symbol'),
    2: sym('number'),
    3: sym('list'),
    4: sym('symbol'),
    5: sym('number'),
    6: sym('number'),
  }),
});

const objectExpression = (value, _, { type }) => ({
  type: type[1],
  value: valtype(value, {
    sym: ([, name]) => name,
    seq: ([, items]) => items,
    _: v => v,
  }),
});

console.log(JSON.stringify(treeOf(doc, objectExpression), null, 2));
//   {
//     "type": "list",
//     "value": [
//       {
//         "type": "symbol",
//         "value": "*"
//       },
//       {
//         "type": "number",
//         "value": 2
//       },
//       {
//         "type": "list",
//         "value": [
//           {
//             "type": "symbol",
//             "value": "+"
//           },
//           {
//             "type": "number",
//             "value": 3
//           },
//           {
//             "type": "number",
//             "value": 4
//           }
//         ]
//       }
//     ]
//   }

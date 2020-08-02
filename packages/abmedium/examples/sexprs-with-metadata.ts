import {
  seq,
  sym,
  num,
  treeOf,
  valswitch,
  proj,
  Layer,
  NodePresenter,
  NodeValue,
} from "@abrovink/abmedium";

// A simple example expression
let exampleDoc: Layer = {
  0: seq(1, 2, 3),
  1: sym("*"),
  2: num(2),
  3: seq(4, 5, 6),
  4: sym("+"),
  5: num(3),
  6: num(4),
};

// A "node presenter" that returns the document as a string
const sexpr: NodePresenter<string> = ({ value, items }) =>
  valswitch<string>({
    sym: ([, name]) => name,
    seq: (_, items) => `(${items.join(" ")})`,
    _: (v) => String(v),
  })(value, items);

console.log("1.", treeOf(proj(exampleDoc), sexpr));
// 1. (* 2 (+ 3 4))

// Add type information in a metalayer
exampleDoc = {
  ...exampleDoc,
  m$type: {
    0: sym("list"),
    1: sym("symbol"),
    2: sym("number"),
    3: sym("list"),
    4: sym("symbol"),
    5: sym("number"),
    6: sym("number"),
  },
};

const objectExpression: NodePresenter<{ type: NodeValue; value: any }> = ({
  value,
  items,
  metadata: { type },
}) =>
  valswitch<{ type: NodeValue; value: any }>({
    sym: ([, name]) => ({ type, value: name }),
    seq: (_, items) => ({ type, value: items }),
    _: (v) => ({ type, value: v }),
  })(value, items);

console.log(
  "2.",
  JSON.stringify(treeOf(proj(exampleDoc), objectExpression), null, 2)
);
//   2. {
//   "type": [
//     "sym",
//     "list"
//   ],
//   "value": [
//     {
//       "type": [
//         "sym",
//         "symbol"
//       ],
//       "value": "*"
//     },
//     {
//       "type": [
//         "sym",
//         "number"
//       ],
//       "value": 2
//     },
//     {
//       "type": [
//         "sym",
//         "list"
//       ],
//       "value": [
//         {
//           "type": [
//             "sym",
//             "symbol"
//           ],
//           "value": "+"
//         },
//         {
//           "type": [
//             "sym",
//             "number"
//           ],
//           "value": 3
//         },
//         {
//           "type": [
//             "sym",
//             "number"
//           ],
//           "value": 4
//         }
//       ]
//     }
//   ]
// }

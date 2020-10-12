import {
  seqn,
  sym,
  symn,
  Sym,
  numn,
  pres,
  presNodeswitch,
  proj,
  NodeValue,
  document,
  nodeValueOf,
} from "@abrovink/abmedium";

import Automerge from "automerge";

const list = sym("list");
const symbol = sym("symbol");
const number = sym("number");

type Meta = { type: Sym };

// A simple example expression
let exampleDoc = Automerge.from(document<Meta>());
exampleDoc = Automerge.change(exampleDoc, (doc) => {
  const base = doc.layers.base;
  base[0] = seqn(0, [1, 2, 3], { type: list });
  base[1] = symn(1, "*", { type: symbol });
  base[2] = numn(2, 2, { type: number });
  base[3] = seqn(3, [4, 5, 6], { type: list });
  base[4] = symn(4, "+", { type: symbol });
  base[5] = numn(5, 3, { type: number });
  base[6] = numn(6, 4, { type: number });
});

// A "node presenter" that returns the document as a string
const sexprPresenter = presNodeswitch<Meta, string>({
  scalar: (n) => String(n.value),
  seq: (_, items) => `(${items.join(" ")})`,
});

console.log("1.", pres(proj(exampleDoc), sexprPresenter));
// 1. (* 2 (+ 3 4))

type SexprObject = {
  type: Sym;
  value: NodeValue | SexprObject[];
};

const objectPresenter = presNodeswitch<Meta, SexprObject>({
  seq: (n, items) => ({ type: n.metadata.type, value: items }),
  scalar: (n) => ({
    type: n.metadata.type,
    value: nodeValueOf(n),
  }),
});

console.log(
  "2.",
  JSON.stringify(pres(proj(exampleDoc), objectPresenter), null, 4)
);
// 2. {
//   "type": {
//       "type": "sym",
//       "value": "list"
//   },
//   "value": [
//       {
//           "type": {
//               "type": "sym",
//               "value": "symbol"
//           },
//           "value": {
//               "type": "sym",
//               "value": "*"
//           }
//       },
//       {
//           "type": {
//               "type": "sym",
//               "value": "number"
//           },
//           "value": {
//               "type": "num",
//               "value": 2
//           }
//       },
//       {
//           "type": {
//               "type": "sym",
//               "value": "list"
//           },
//           "value": [
//               {
//                   "type": {
//                       "type": "sym",
//                       "value": "symbol"
//                   },
//                   "value": {
//                       "type": "sym",
//                       "value": "+"
//                   }
//               },
//               {
//                   "type": {
//                       "type": "sym",
//                       "value": "number"
//                   },
//                   "value": {
//                       "type": "num",
//                       "value": 3
//                   }
//               },
//               {
//                   "type": {
//                       "type": "sym",
//                       "value": "number"
//                   },
//                   "value": {
//                       "type": "num",
//                       "value": 4
//                   }
//               }
//           ]
//       }
//   ]
// }

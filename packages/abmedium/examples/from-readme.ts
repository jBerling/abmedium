import {
  seq,
  num,
  str,
  // proj,
  // treeOf,
  // valswitch,
  // NodePresenter,
  document,
} from "@abrovink/abmedium";

import Automerge from "automerge";

// ## Document Structure

let treeDoc = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base[0] = { label: 0, value: seq(1, 2, 3) };
  doc.layers.base[1] = { label: 1, value: seq(4, 5) };
  doc.layers.base[2] = { label: 2, value: seq(6, 7) };
  doc.layers.base[3] = { label: 3, value: seq(8, 9) };
  doc.layers.base[4] = { label: 4, value: str("a") };
  doc.layers.base[5] = { label: 5, value: num(1) };
  doc.layers.base[6] = { label: 6, value: str("b") };
  doc.layers.base[7] = { label: 7, value: num(2) };
  doc.layers.base[8] = { label: 8, value: str("c") };
  doc.layers.base[9] = { label: 9, value: num(3) };
});

console.log(treeDoc);

// const stringPresenter: NodePresenter<{}, string> = ({ value, items }) =>
//   valswitch({
//     seq: (_, items) => `[${items.join(", ")}]`,
//     str: () => `"${value}"`,
//     sym: ([, name]) => name,
//     dis: ([, { expected, actual, to }]) => `»${expected} ≠ ${actual} → ${to}«`,
//     _: (v) => String(v),
//   })(value, items);

// let out = treeOf(proj(treeDoc), stringPresenter);
// console.log("1.", out);
// 1. [["apple", 1], ["banana", 2], ["pear", 3]]

// const dagdoc = {
//   0: seq(1, 1),
//   1: str("same"),
// };

// out = treeOf(proj(dagdoc), stringPresenter);
// console.log("2.", out);
// // 2. ["same", "same"]

// // ## Layers and Projections

// // translations
// treedoc = {
//   ...treedoc,
//   se: {
//     4: str("äpple"),
//     6: str("banan"),
//     8: str("päron"),
//   },
// };

// out = treeOf(proj(treedoc, ["se"]), stringPresenter);
// console.log("3.", out);
// // 3. [["äpple", 1], ["banan", 2], ["päron", 3]]

// // ## Disagreements and Simultaneities

// // translations with mappings
// treedoc = {
//   ...treedoc,
//   se: {
//     4: str("äpple"),
//     6: str("banan"),
//     8: str("päron"),
//     [trackedLabel]: {
//       4: str("apple"),
//       6: str("banana"),
//       8: str("pear"),
//     },
//   },
// };

// const stringAndConflictPresenter: NodePresenter<string> = ({
//   value,
//   items,
//   disagreement,
// }) =>
//   valswitch({
//     seq: (_, items) => `[${items.join(", ")}]`,
//     str: () =>
//       disagreement
//         ? `»${disagreement.expected} ≠ ${disagreement.actual} → ${value}«`
//         : `"${value}"`,
//     sym: ([, name]) => name,
//     _: (v) => String(v),
//   })(value, items);

// out = treeOf(proj(treedoc, ["se"]), stringAndConflictPresenter);
// console.log("4.", out);
// // 4. [["äpple", 1], ["banan", 2], ["päron", 3]]

// out = treeOf(
//   proj({ ...treedoc, 4: str("lemon") }, ["se"]),
//   stringAndConflictPresenter
// );
// console.log("5.", out);
// // 5. [[»"apple" ≠ "lemon" → "äpple"«, 1], ["banan", 2], ["päron", 3]]

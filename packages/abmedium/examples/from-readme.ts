import {
  seq,
  num,
  str,
  proj,
  treeOf,
  valswitch,
  nodeswitch,
  NodePresenter,
  NodeValue,
  PresentationNode,
  document,
  layer,
} from "@abrovink/abmedium";

import Automerge from "automerge";

// ## Document Structure

let fruits = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base[0] = { label: 0, value: seq(1, 2, 3) };
  doc.layers.base[1] = { label: 1, value: seq(4, 5) };
  doc.layers.base[2] = { label: 2, value: seq(6, 7) };
  doc.layers.base[3] = { label: 3, value: seq(8, 9) };
  doc.layers.base[4] = { label: 4, value: str("apple") };
  doc.layers.base[5] = { label: 5, value: num(1) };
  doc.layers.base[6] = { label: 6, value: str("banana") };
  doc.layers.base[7] = { label: 7, value: num(2) };
  doc.layers.base[8] = { label: 8, value: str("pear") };
  doc.layers.base[9] = { label: 9, value: num(3) };
});

const stringPresenter: NodePresenter<{}, string> = ({ value, items }) =>
  valswitch({
    seq: (_, items) => `[${items.join(", ")}]`,
    str: () => `"${value}"`,
    _: (v) => String(v),
  })(value, items);

let out = treeOf(proj(fruits), stringPresenter);
console.log("1.", out);
// ⇒ 1. [(["apple", 1], ["banana", 2], ["pear", 3])];

let dag = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base[0] = { label: 0, value: seq(1, 1) };
  doc.layers.base[1] = { label: 1, value: str("same") };
});

out = treeOf(proj(dag), stringPresenter);
console.log("2.", out);
// ⇒ 2. ["same", "same"]

// ## Layers and Projections

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se = layer<{}>();
  doc.compositions.se = {
    label: "base",
    layers: [{ label: "se" }],
  };
});

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4] = { label: 4, value: str("äpple") };
  doc.layers.se[6] = { label: 6, value: str("banan") };
  doc.layers.se[8] = { label: 8, value: str("päron") };
});

out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter);
console.log("3.", out);
// ⇒ 3. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Disagreements

const stringPresenter2: NodePresenter<{}, string> = (node) =>
  nodeswitch<{}, string, NodeValue, PresentationNode<{}, string>>({
    seq: ({ items = [] }) => `[${items.join(", ")}]`,
    str: ({ value, disagreement }) => {
      if (disagreement) {
        const [, { expected, actual, to }] = disagreement;
        return `»${expected} ≠ ${actual} → ${to}«`;
      } else return `"${value}"`;
    },
    _: ({ value }) => String(value),
  })(node);

out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("4.", out);
// ⇒ 4. [[»undefined ≠ apple → äpple«, 1], [»undefined ≠ banana → banan«, 2], [»undefined ≠ pear → päron«, 3]]

fruits = Automerge.change(fruits, (doc) => {
  // TODO understand why this doesn't work
  // doc.layers.se[4].tracked = str("apple");
  // doc.layers.se[6].tracked = str("banana");
  // doc.layers.se[8].tracked = str("pear");

  doc.layers.se[4] = {
    label: 4,
    value: str("äpple"),
    tracked: str("apple"),
  };

  doc.layers.se[6] = {
    label: 6,
    value: str("banan"),
    tracked: str("banana"),
  };

  doc.layers.se[8] = {
    label: 8,
    value: str("päron"),
    tracked: str("pear"),
  };
});

out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("5.", out);
// ⇒ 5. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Simultaneities

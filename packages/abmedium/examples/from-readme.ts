import {
  seq,
  num,
  str,
  proj,
  treeOf,
  valswitch,
  NodePresenter,
  Layer,
  trackedLabel,
} from "@abrovink/abmedium";

// ## Document Structure

let treedoc: Layer = {
  0: seq(1, 2, 3),
  1: seq(4, 5),
  2: seq(6, 7),
  3: seq(8, 9),
  4: str("apple"),
  5: num(1),
  6: str("banana"),
  7: num(2),
  8: str("pear"),
  9: num(3),
};

const stringPresenter: NodePresenter<string> = ({ value, items }) =>
  valswitch({
    seq: (_, items) => `[${items.join(", ")}]`,
    str: () => `"${value}"`,
    sym: ([, name]) => name,
    dis: ([, { expected, actual, to }]) => `»${expected} ≠ ${actual} → ${to}«`,
    _: (v) => String(v),
  })(value, items);

let out = treeOf(proj(treedoc), stringPresenter);
console.log("1.", out);
// 1. [["apple", 1], ["banana", 2], ["pear", 3]]

const dagdoc = {
  0: seq(1, 1),
  1: str("same"),
};

out = treeOf(proj(dagdoc), stringPresenter);
console.log("2.", out);
// 2. ["same", "same"]

// ## Layers and Projections

// translations
treedoc = {
  ...treedoc,
  se: {
    4: str("äpple"),
    6: str("banan"),
    8: str("päron"),
  },
};

out = treeOf(proj(treedoc, ["se"]), stringPresenter);
console.log("3.", out);
// 3. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Disagreements and Simultaneities

// translations with mappings
treedoc = {
  ...treedoc,
  se: {
    4: str("äpple"),
    6: str("banan"),
    8: str("päron"),
    [trackedLabel]: {
      4: str("apple"),
      6: str("banana"),
      8: str("pear"),
    },
  },
};

const stringAndConflictPresenter: NodePresenter<string> = ({
  value,
  items,
  disagreement,
}) =>
  valswitch({
    seq: (_, items) => `[${items.join(", ")}]`,
    str: () =>
      disagreement
        ? `»${disagreement.expected} ≠ ${disagreement.actual} → ${value}«`
        : `"${value}"`,
    sym: ([, name]) => name,
    _: (v) => String(v),
  })(value, items);

out = treeOf(proj(treedoc, ["se"]), stringAndConflictPresenter);
console.log("4.", out);
// 4. [["äpple", 1], ["banan", 2], ["päron", 3]]

out = treeOf(
  proj({ ...treedoc, 4: str("lemon") }, ["se"]),
  stringAndConflictPresenter
);
console.log("5.", out);
// 5. [[»"apple" ≠ "lemon" → "äpple"«, 1], ["banan", 2], ["päron", 3]]

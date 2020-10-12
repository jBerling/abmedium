import {
  node,
  seq,
  num,
  str,
  strn,
  proj,
  pres,
  presNodeswitch,
  NodePresenter,
  document,
  Document,
  layer,
} from "@abrovink/abmedium";

import Automerge from "automerge";

// ## Document Structure

let fruits = Automerge.from(document<{}>());

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.base[0] = node(0, seq([1, 2, 3]), {});
  doc.layers.base[1] = node(1, seq([4, 5]), {});
  doc.layers.base[2] = node(2, seq([6, 7]), {});
  doc.layers.base[3] = node(3, seq([8, 9]), {});
  doc.layers.base[4] = node(4, str("apple"), {});
  doc.layers.base[5] = node(5, num(1), {});
  doc.layers.base[6] = node(6, str("banana"), {});
  doc.layers.base[7] = node(7, num(2), {});
  doc.layers.base[8] = node(8, str("pear"), {});
  doc.layers.base[9] = node(9, num(3), {});
});

const stringPresenter: NodePresenter<{}, string> = presNodeswitch({
  seq: (_, items) => `[${items.join(", ")}]`,
  str: (n) => `"${n.value}"`,
  _: (n) => String(n.value),
});

let out = pres(proj(fruits), stringPresenter);
console.log("1.", out);
// ⇒ 1. [(["apple", 1], ["banana", 2], ["pear", 3])];

let dag = Automerge.change(Automerge.from(document<{}>()), (doc) => {
  doc.layers.base[0] = node(0, seq([1, 1]), {});
  doc.layers.base[1] = node(1, str("same"), {});
});

out = pres(proj(dag), stringPresenter);
console.log("2.", out);
// ⇒ 2. ["same", "same"]

// // ## Layers and Projections

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se = layer<{}>();
  doc.compositions.se = {
    label: "base",
    layers: [{ label: "se" }],
  };
});

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4] = strn(4, "äpple", {});
  doc.layers.se[6] = strn(6, "banan", {});
  doc.layers.se[8] = strn(8, "päron", {});
});

out = pres(proj(fruits, fruits.compositions.se), stringPresenter);
console.log("3.", out);
// ⇒ 3. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Disagreements

const stringPresenter2: NodePresenter<{}, string> = presNodeswitch({
  seq: (_, items) => `[${items.join(", ")}]`,
  str: ({ value, disagreements }) => {
    if (disagreements) {
      const { expected, actual, to } = disagreements.se;

      return `»${expected?.value} ≠ ${actual?.value} → ${to?.value}«`;
    } else return `"${value}"`;
  },
  _: (n) => String(n.value),
});

out = pres(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("4.", out);
// ⇒ 4. [[»undefined ≠ apple → äpple«, 1], [»undefined ≠ banana → banan«, 2], [»undefined ≠ pear → päron«, 3]]

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4] = strn(4, "äpple", {}, str("apple"));
  doc.layers.se[6] = strn(6, "banan", {}, str("banana"));
  doc.layers.se[8] = strn(8, "päron", {}, str("pear"));
});

out = pres(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("5.", out);
// ⇒ 5. [["äpple", 1], ["banan", 2], ["päron", 3]]

// ## Simultaneities

// create a new document and add the content of the original document
let fruits2 = Automerge.init<Document<{}>>();
fruits2 = Automerge.merge(fruits2, fruits);

// update the original document
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4].value = "Äpple";
});

// update the new document
fruits2 = Automerge.change(fruits2, (doc) => {
  doc.layers.se[4].value = "ÄPPLE";
});

// merge original with new document
fruits = Automerge.merge(fruits, fruits2);

const stringPresenter3: NodePresenter<{}, string> = presNodeswitch({
  seq: (_, items) => `[${items.join(", ")}]`,
  str: ({ value, disagreements, simultaneities }) => {
    if (disagreements) {
      const { expected, actual, to } = disagreements.se;
      return `»${expected?.value} ≠ ${actual?.value} → ${to?.value}«`;
    } else if (simultaneities) {
      return `{${Object.values(simultaneities)
        .map(({ value }) => String(value))
        .join(" ")}}`;
    } else return `"${value}"`;
  },
  _: (n) => String(n.value),
});

out = pres(proj(fruits, fruits.compositions.se), stringPresenter3);
console.log("6.", out);
// ⇒ 6. [[{"Äpple" "ÄPPLE"}, 1], ["banan", 2], ["päron", 3]]

fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4].value = "Äpple";
});

out = pres(proj(fruits, fruits.compositions.se), stringPresenter3);
console.log("7.", out);
// ⇒ 7. [(["Äpple", 1], ["banan", 2], ["päron", 3])];

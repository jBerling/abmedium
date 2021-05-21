import {
  seqn,
  str,
  Str,
  strn,
  txtn,
  pres,
  presNodeswitch,
  proj,
  document,
} from "../dist";

import Automerge from "automerge";

/*
In this example file we are going to use Text nodes.
*/

let doc = Automerge.from(document<{ author: Str }>());

doc = Automerge.change(doc, (doc) => {
  const base = doc.layers.base;

  base[0] = seqn(0, ["header", "body"], { author: str("Sixten") });
  base["header"] = strn("header", "An Example Document", {
    author: str("Sixten"),
  });
  base["body"] = txtn("body", `It all began with a strange document format`, {
    author: str("Sixten"),
  });
});

const docPresenter = presNodeswitch<{ author: Str }, string>({
  seq: (_, content) => content.join("\n"),
  scalar: (n) => String(n.value),
});

console.log("1.", doc);

console.log("2.", proj(doc));

console.log("3.", pres(proj(doc), docPresenter));

console.log("4.", doc.layers.base.header);

console.log("5.", doc.layers.base.body);

console.log("6.", doc.layers.base.body.value);

// /////

// import Automerge from "automerge";

// let doc1 = Automerge.from({
//   paragraphs: [new Automerge.Text("I am a header")],
// });

// doc1 = Automerge.change(doc1, "add a paragraph", (doc) => {
//   doc.paragraphs[1] = new Automerge.Text("I am an intro");
// });

// console.log(
//   "PONG",
//   doc1.paragraphs.map((text) => text.toString())
// );

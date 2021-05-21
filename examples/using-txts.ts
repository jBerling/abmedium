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
  Txt,
} from "../dist";

import Automerge, { Text } from "automerge";

/*
Just a simple example using Txt. Not a lot of thought have gone into this...
*/

let doc = Automerge.from(document<{ author: Str }>());

doc = Automerge.change(doc, (doc) => {
  const base = doc.layers.base;

  base[0] = seqn(0, ["title"], { author: str("Sixten") });
  base.title = strn("title", "An example document", {
    author: str("Sixten"),
  });
});

doc = Automerge.change(doc, (doc) => {
  const base = doc.layers.base;
  const root = base[0];
  if (root !== null && root.value !== null) root.value[1] = "chapter1";
  base.chapter1 = txtn("chapter1", new Text("What to begin with?"), {
    author: str("Sixten"),
  });
});

const stringPresenter = presNodeswitch<{ author: Str }, string>({
  seq: (_, content) => content.join("\n"),
  scalar: (n) => String(n.value),
});

console.log("1.", pres(proj(doc), stringPresenter));

doc = Automerge.change(doc, (doc) => {
  const chapter1: Txt = doc.layers.base.chapter1 as Txt;

  if (chapter1?.value?.insertAt !== undefined) {
    chapter1.value.insertAt(19, " What?");
  }
});

console.log(`
Presented
---------
${pres(proj(doc), stringPresenter)}
---------
`);

console.log(`
Saved
-----
${new TextDecoder().decode(Automerge.save(doc))}
-----
`);

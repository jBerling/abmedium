import {
  seqn,
  symn,
  str,
  strn,
  pres,
  presNodeswitch,
  proj,
  document,
  layer,
} from "@abrovink/abmedium";

import Automerge from "automerge";

/*
Write the HTML as S-expressions.

(html
    (head
        (title "Abmedium")) 
    (body 
        (h1 "Abmedium")
        (p "Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.")))

*/

let doc = Automerge.from(document<{}>());
doc = Automerge.change(doc, (doc) => {
  const base = doc.layers.base;

  for (const name of ["html", "head", "title", "body", "h1", "p"]) {
    base[name] = symn(name, name, {});
  }

  base[0] = seqn(0, ["html", 1, 3], {});
  base[1] = seqn(1, ["head", 2], {});
  base[2] = seqn(2, ["title", "header"], {});
  base["header"] = strn("header", "About Abmedium", {});
  base[3] = seqn(3, ["body", 4, 5], {});
  base[4] = seqn(4, ["h1", "header"], {});
  base[5] = seqn(5, ["p", 6], {});
  base[6] = strn(
    6,
    "Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.",
    {}
  );
});

// Add Swedish translations

doc = Automerge.change(doc, (doc) => {
  doc.layers.se = layer<{}>();
  const se = doc.layers.se;

  se["header"] = strn("header", "Om Abmedium", {}, str("About Abmedium"));

  se[6] = strn(
    6,
    "Abmedium är ett grafmedium. Till skillnad från text kan det innehålla loopar och noder med flera föräldrar.",
    {},
    str(
      "Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents."
    )
  );

  doc.compositions.se = { label: "base", layers: [{ label: "se" }] };
});

const htmlStringPresenter = presNodeswitch<{}, string>({
  seq: (_, [tag, ...children]) => `<${tag}>${children.join("")}</${tag}>`,
  scalar: (n) => String(n.value),
});
console.log("1.", pres(proj(doc), htmlStringPresenter));
// 1. <html>
//   <head>
//     <title>About Abmedium</title>
//   </head>
//   <body>
//     <h1>About Abmedium</h1>
//     <p>
//       Abmedium is a graph medium. Unlike text it can contain loops and nodes
//       with multiple parents.
//     </p>
//   </body>
// </html>;

console.log("2.", pres(proj(doc, doc.compositions.se), htmlStringPresenter));
// 2. <html>
//   <head>
//     <title>Om Abmedium</title>
//   </head>
//   <body>
//     <h1>Om Abmedium</h1>
//     <p>
//       Abmedium är ett grafmedium. Till skillnad från text kan det innehålla
//       loopar och noder med flera föräldrar.
//     </p>
//   </body>
// </html>

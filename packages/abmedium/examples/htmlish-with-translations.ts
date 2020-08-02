import {
  seq,
  sym,
  str,
  treeOf,
  valswitch,
  proj,
  Layer,
  NodePresenter,
} from "@abrovink/abmedium";

/*
Write the HTML as S-expressions.

(html
    (head
        (title "Abmedium")) 
    (body 
        (h1 "Abmedium")
        (p "Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.")))

*/

const htmlNodes: Layer = {
  html: sym("html"),
  head: sym("head"),
  title: sym("title"),
  body: sym("body"),
  h1: sym("h1"),
  p: sym("p"),
  emptyAttrs: seq(),
};

let doc: Layer = {
  ...htmlNodes,
  header: str("About Abmedium"),
  0: seq("html", 1, 3),
  1: seq("head", 2),
  2: seq("title", "header"),
  3: seq("body", 4, 5),
  4: seq("h1", "header"),
  5: seq("p", 6),
  6: str(
    "Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents."
  ),
};

// Add Swedish translations
doc = {
  ...doc,
  se: {
    header: str("Om Abmedium"),
    6: str(
      "Abmedium är ett grafmedium. Till skillnad från text kan det innehålla loopar och noder med flera föräldrar."
    ),
  },
};

const htmlString: NodePresenter<string> = ({ value, items }): string =>
  valswitch<string>({
    seq: (_, [tag, ...children]) => `<${tag}>${children.join("")}</${tag}>`,
    _: (v) => String(v),
    sym: ([, type]) => type,
  })(value, items);

console.log("1.", treeOf(proj(doc), htmlString));
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

console.log("2.", treeOf(proj(doc, ["se"]), htmlString));
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

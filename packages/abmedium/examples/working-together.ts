import {
  seq,
  seqn,
  sym,
  symn,
  strn,
  pres,
  proj,
  presNodeswitch,
  NodePresenter,
  document,
  Document,
  layer,
} from "@abrovink/abmedium";

import Automerge from "automerge";

const sexpr = presNodeswitch<{}, string>({
  str: (n) => `"${n.value}"`,
  scalar: (n) => String(n.value),
  seq: (_, items) => `(${items.join(" ")})`,
});

const disagreementWrapper = (
  switcher: NodePresenter<{}, string>
): NodePresenter<{}, string> => (n, items) =>
  n.disagreements ? `<<disagreement ${n.label}>>` : switcher(n, items);

const sexprPresenter = disagreementWrapper(sexpr);

// Store the function greet!
//
//     (fun greet! (name)
//       (send!
//         (str "Hello " name "!")))
//
let greetDoc = Automerge.from(document<{}>());

greetDoc = Automerge.change(greetDoc, (doc) => {
  const base = doc.layers.base;

  base[0] = seqn(0, [1, 2, 3, 5], {});
  base[1] = symn(1, "fun", {});
  base[2] = symn(2, "greet!", {});
  base[3] = seqn(3, [4], {});
  base[4] = symn(4, "name", {});
  base[5] = seqn(5, [6, 7], {});
  base[6] = symn(6, "send!", {});
  base[7] = seqn(7, [8, 9, 4, 10], {});
  base[8] = symn(8, "str", {});
  base[9] = strn(9, "Hello ", {});
  base[10] = strn(10, "!", {});
});

console.log("1.", pres(proj(greetDoc), sexprPresenter));
// 1. (fun greet! (name) (send! (str "Hello " name "!")))

// Add another parameter, greeting, to greet!
// Do this in a layer named greeting-param

greetDoc = Automerge.change(greetDoc, (doc) => {
  doc.layers.greetingParam = layer<{}>();
  const greetingParam = doc.layers.greetingParam;

  doc.compositions.withGreetingParam = {
    label: "base",
    layers: [{ label: "greetingParam" }],
  };

  greetingParam[3] = seqn(3, [4, 11], {}, seq([4]));
  greetingParam[7] = seqn(7, [8, 11, 12, 4, 10], {}, seq([8, 9, 4, 10]));
  greetingParam[11] = symn(11, "greeting", {});
  greetingParam[12] = strn(12, " ", {});
});

// To "turn on" the feature, project the withGreetingParam composition

console.log(
  "2.",
  pres(proj(greetDoc, greetDoc.compositions.withGreetingParam), sexprPresenter)
);
// 2. (fun greet! (name greeting) (send! (str greeting " " name "!")))

// To "turn off" the feature, project the document without a stack
console.log("3.", pres(proj(greetDoc), sexprPresenter));
// 3. (fun greet! (name) (send! (str "Hello " name "!")))

// Let John and Alice work on the greetingParam feature.
// To begin with they create a document each to work on.
// (Imagine this happens on their respective computer)

let johnDoc = Automerge.init<Document<{}>>();
johnDoc = Automerge.merge(johnDoc, greetDoc);

let aliceDoc = Automerge.init<Document<{}>>();
aliceDoc = Automerge.merge(aliceDoc, greetDoc);

const syncDocs = () => {
  johnDoc = Automerge.merge(johnDoc, aliceDoc);
  aliceDoc = Automerge.merge(aliceDoc, johnDoc);
  greetDoc = Automerge.merge(greetDoc, aliceDoc);
};

// They decide to work in a personal layer placed on top of the greetingParam layer.
// Alice take the lead and create the needed layers and a two new compositions.
// During development Alice will use withGreetingParamAlice
// and John will use withGreetingParamJohn.
aliceDoc = Automerge.change(aliceDoc, (doc) => {
  doc.layers.alice = layer<{}>();

  doc.layers.john = layer<{}>();

  doc.compositions.withGreetingParamAlice = {
    label: "base",
    layers: [
      {
        label: "greetingParam",
        layers: [{ label: "john" }, { label: "alice" }],
      },
    ],
  };

  doc.compositions.withGreetingParamJohn = {
    label: "base",
    layers: [
      {
        label: "greetingParam",
        layers: [{ label: "alice" }, { label: "john" }],
      },
    ],
  };
});

syncDocs();

// John updates the document
johnDoc = Automerge.change(johnDoc, (doc) => {
  const john = doc.layers.john;
  john[7] = seqn(7, [13, 11, 4], {}, seq([8, 11, 12, 4, 10]));
  john[13] = symn(13, "as-template", {});
});

syncDocs();

console.log(
  "4.",
  pres(
    proj(johnDoc, johnDoc.compositions.withGreetingParamJohn),
    sexprPresenter
  )
);
// 4. (fun greet! (name greeting) (send! (as-template greeting name)))

// Alice updates the document
aliceDoc = Automerge.change(aliceDoc, (doc) => {
  const alice = doc.layers.alice;
  alice[11] = symn(11, "greeting-template", {}, sym("greeting"));
  alice[13] = symn(13, "message", {}, sym("as-template"));
});

syncDocs();

console.log(
  "5.",
  pres(
    proj(aliceDoc, aliceDoc.compositions.withGreetingParamAlice),
    sexprPresenter
  )
);
// 5. (fun greet! (name greeting-template) (send! (message greeting-template name)))

// So far things look good, until you realize there is now a disagreement in John's composition.

console.log(
  "6.",
  pres(
    proj(johnDoc, johnDoc.compositions.withGreetingParamJohn),
    sexprPresenter
  )
);
// 6. (fun greet! (name greeting-template) (send! (<<disagreement 13>> greeting-template name)))

// When John updated the 13 node he expected it to not cover a value. Now that Alice has created a node,
// and John's layer in John's composition is covering her layer there is a disagreement.
//
// Now John and Alice need to either rewrite their code or accept the fact that their layers are no longer
// independent and alice needs to be projected on top of john.
//
// They decide to keep it as it is, and John adds a new layer and create new compositions for him and Alice.

johnDoc = Automerge.change(johnDoc, (doc) => {
  doc.layers.john2 = layer<{}>();
  doc.compositions.withGreetingParamJohn.layers = [
    { label: "john" },
    { label: "alice" },
    { label: "john2" },
  ];

  doc.compositions.withGreetingParamAlice.layers = [
    { label: "john" },
    { label: "john2" },
    { label: "alice" },
  ];
});

syncDocs();

// Now John and Alice can continue to develop the GreetingParam feature.

import {
  seq,
  sym,
  str,
  treeOf,
  proj,
  valswitch,
  NodePresenter,
  PresentationNode,
  Layer,
  trackedLabel,
} from "@abrovink/abmedium";

// A node presenter function that returns the document as a string
const sexpr: NodePresenter<string> = ({
  value,
  label,
  items,
  disagreement,
}: PresentationNode<string>) => {
  if (disagreement) {
    return `<<disagreement ${label}>>`;
  }

  return valswitch<string>({
    sym: ([, name]) => name,
    seq: (_, sexprs) => `(${sexprs.join(" ")})`,
    str: (v) => `"${v}"`,
    // dis: ([, { expected, actual, to }]) =>
    //   `(disagreement (${expected} ${actual} ${to}))`,
    _: (v) => String(v),
  })(value, items);
};

// Store the function greet!
//
//     (fun greet! (name)
//       (send!
//         (str "Hello " name "!")))
//
let greetDoc: Layer = {
  0: seq(1, 2, 3, 5),
  1: sym("fun"),
  2: sym("greet!"),
  3: seq(4),
  4: sym("name"),
  5: seq(6, 7),
  6: sym("send!"),
  7: seq(8, 9, 4, 10),
  8: sym("str"),
  9: str("Hello "),
  10: str("!"),
};

console.log("1.", treeOf(proj(greetDoc), sexpr));
// 1. (fun greet! (name) (send! (str "Hello " name "!")))

// Add another parameter, greeting, to greet!
// Do this in a layer named greeting-param
greetDoc = {
  ...greetDoc,
  "greeting-param": {
    3: seq(4, 11),
    7: seq(8, 11, 12, 4, 10),
    11: sym("greeting"),
    12: str(" "),
    [trackedLabel]: {
      3: seq(4),
      7: seq(8, 9, 4, 10),
    },
  },
};

// To "turn on" the feature, project the document
// with the ['greeting-param'] view stack
console.log("2.", treeOf(proj(greetDoc, ["greeting-param"]), sexpr));
// 2. (fun greet! (name greeting) (send! (str greeting " " name "!")))

// To "turn off" the feature, project the document without a stack
console.log("3.", treeOf(proj(greetDoc), sexpr));
// 3. (fun greet! (name) (send! (str "Hello " name "!")))

// Add sublayers to "greeting-param" representing the changes of john and alice
greetDoc = {
  ...greetDoc,
  "greeting-param": {
    ...(greetDoc["greeting-param"] as Layer),
    john: {
      7: seq(13, 11, 4),
      13: sym("as-template"),
      [trackedLabel]: {
        7: seq(8, 11, 12, 4, 10),
      },
    },
    alice: {
      11: sym("greeting-template"),
      13: sym("message"),
      [trackedLabel]: {
        11: sym("greeting"),
        13: sym("as-template"),
      },
    },
  },
};

// To turn on their changes use the stack
// [['greeting-param', ['john', 'alice']]]
// The stack represents the greeting-param layer and its sublayers.
// Unfortunately the current stack format is very hard to read.
// If you choose to represent it as a bulleted list it would have looked like
//
//     * greeting-param
//         * john
//         * alice
//
console.log(
  "4.",
  treeOf(proj(greetDoc, [["greeting-param", ["john", "alice"]]]), sexpr)
);
// 4. (fun greet! (name greeting-template) (send! (message greeting-template name)

// Since john and alice have updated the same node (13) they need to be
// projected in the right order. If you project john on top of alice you will
// get a disagreement (actually a nested one, since both layers result in a disagreement)
console.log(
  "5.",
  treeOf(proj(greetDoc, [["greeting-param", ["alice", "john"]]]), sexpr)
);
// 5. (fun greet! (name greeting-template) (send! (<<disagreement 13>> greeting-template name)))

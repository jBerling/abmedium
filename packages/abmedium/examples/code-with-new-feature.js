const {
  document,
  layer,
  seq,
  sym,
  str,
  treeOf,
  valtype,
  mapping,
  proj,
} = require('@abrovink/abmedium');

// A node presenter function that returns the document as a string
const sexpr = value =>
  valtype(value, {
    sym: ([, name]) => name,
    seq: ([, items]) => `(${items.join(' ')})`,
    str: v => `"${v}"`,
    dis: ([, { expected, actual, to }]) =>
      `(disagreement (${expected} ${actual} ${to}))`,
    _: v => v,
  });

// Store the function greet!
//
//     (fun greet! (name)
//       (send!
//         (str "Hello " name "!")))
//
let greetDoc = document({
  0: seq(1, 2, 3, 5),
  1: sym('fun'),
  2: sym('greet!'),
  3: seq(4),
  4: sym('name'),
  5: seq(6, 7),
  6: sym('send!'),
  7: seq(8, 9, 4, 10),
  8: sym('str'),
  9: str('Hello '),
  10: str('!'),
});

console.log('1.', treeOf(greetDoc, sexpr));
// 1. (fun greet! (name) (send! (str "Hello " name "!")))

// Add another parameter, greeting, to greet!
// Do this in a layer named greeting-param
greetDoc = {
  ...greetDoc,
  'greeting-param': layer({
    3: mapping(seq(4, 11), seq(4)),
    7: mapping(seq(8, 11, 12, 4, 10), seq(8, 9, 4, 10)),
    11: sym('greeting'),
    12: str(' '),
  }),
};

// To "turn on" the feature, project the document
// with the ['greeting-param'] view stack
console.log('2.', treeOf(proj(greetDoc, ['greeting-param']), sexpr));
// 2. (fun greet! (name greeting) (send! (str greeting " " name "!")))

// To "turn off" the feature, project the document without a stack
console.log('3.', treeOf(proj(greetDoc), sexpr));
// 3. (fun greet! (name) (send! (str "Hello " name "!")))

// Add sublayers to "greeting-param" representing the changes of john and alice
greetDoc = {
  ...greetDoc,
  'greeting-param': {
    ...greetDoc['greeting-param'],
    john: layer({
      7: mapping(seq(13, 11, 4), seq(8, 11, 12, 4, 10)),
      13: mapping(sym('as-template')),
    }),
    alice: layer({
      11: mapping(sym('greeting-template'), sym('greeting')),
      13: mapping(sym('message'), sym('as-template')),
    }),
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
  '4.',
  treeOf(proj(greetDoc, [['greeting-param', ['john', 'alice']]]), sexpr)
);
// 4. (fun greet! (name greeting-template) (send! (message greeting-template name)

// Since john and alice have updated the same node (13) they need to be
// projected in the right order. If you project john on top of alice you will
// get a disagreement (actually a nested one, since both layers result in a disagreement)
console.log(
  '5.',
  treeOf(proj(greetDoc, [['greeting-param', ['alice', 'john']]]), sexpr)
);
// 5. (fun greet! (name greeting-template) (send! ((disagreement (undefined (disagreement (sym,as-template undefined sym,message)) as-template)) greeting-template name)))

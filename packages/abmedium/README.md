# Abmedium

Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.

It is made for distributed, structured editing in multilingual environments. A node can have values in different _layers_. Layers can be put in layer compositions and projected. This way different projections can be created from one document. Projections can contain localized content, and emulate feature toggles/branches.

Layers can get in a conflict when they are projected in a stack. This is called a _disagreement_ and is one of the two types of conflicts Abmedium handles. The other type is _simultaneities_. They occur when a node is edited concurrently.

## Terminology

- _Documents_ is a collection of layers and compositions.
- _Layers_ are sets of nodes.
- All nodes have _Labels_. They can be numbers or strings.
- _Nodes_ are values with a label.
- _Values_ are sequences, strings, symbols, numbers, refs or nil.
- _Projections_ are created when a composition is projected.
- _Layer Composition_ describes which layers, and in what order, to project.
- _Disagreements_ are created during a projection. They represent a mismatch between an expected and actual value.
- _Simultaneities_ are created when new values are added concurrently to the same node.

## Document Structure

Let's put the content `[["a", 1], ["b", 2], ["c", 3]]` into an Abmedium document. This is done by destructuring the content into nodes.

```javascript
let fruits = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base.nodes[0] = { label: 0, value: seq(1, 2, 3) };
  doc.layers.base.nodes[1] = { label: 1, value: seq(4, 5) };
  doc.layers.base.nodes[2] = { label: 2, value: seq(6, 7) };
  doc.layers.base.nodes[3] = { label: 3, value: seq(8, 9) };
  doc.layers.base.nodes[4] = { label: 4, value: str("apple") };
  doc.layers.base.nodes[5] = { label: 5, value: num(1) };
  doc.layers.base.nodes[6] = { label: 6, value: str("banana") };
  doc.layers.base.nodes[7] = { label: 7, value: num(2) };
  doc.layers.base.nodes[8] = { label: 8, value: str("pear") };
  doc.layers.base.nodes[9] = { label: 9, value: num(3) };
});
```

This is a very cumbersome format. Don't be frightened! The library is meant to be used in the background and not manipulated directly as in this document.

To make sure we have not lost our content structure, let's rebuild it!

```javascript
const stringPresenter: NodePresenter<{}, string> = ({ value, items }) =>
  valswitch({
    seq: (_, items) => `[${items.join(", ")}]`,
    str: () => `"${value}"`,
    _: (v) => String(v),
  })(value, items);

let out = treeOf(proj(fruits), stringPresenter);
console.log("1.", out);
// ⇒ 1. [(["apple", 1], ["banana", 2], ["pear", 3])];
```

There is a lot going on here. To begin with, let's talk about the elephant in the room. Why this strange structure?

One big reason is that every node get a handle. This way we can easily target specific nodes. This is handy when the document is edited, or if you want to link to a specific node. Remember, Abmedium is not a text medium. Therefore we need a way to pinpoint a specific place in the document the way you can point to a specific character at a specific line.

Another reason is that it let's us express other graphs than trees. The example above is a tree, but let's say we want to express a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).

```javascript
let dag = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base.nodes[0] = { label: 0, value: seq(1, 1) };
  doc.layers.base.nodes[1] = { label: 1, value: str("same") };
});
```

If we want to print it we need to turn it to a tree again.

```javascript
out = treeOf(proj(dag), stringPresenter);
console.log("2.", out);
// ⇒ 2. ["same", "same"]
```

The structure also works with layers and projections.

By the way, Abmedium is built on top of [Automerge](https://github.com/automerge/automerge). If it is new for you, you should probably take a look at it before you continue to read.

## Layers and Projections

A document has layers. It is a collection of nodes.

So far we have only worked with one layer, the base layer which is part of a document by default. Let's add another layer.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se = layer < {} > "se";
  doc.compositions.se = {
    label: "base",
    layers: [{ label: "se" }],
  };
});
```

Above we add a layer with the layer "se". We also add a _layer composition_, which is used to define the relation between layers. In this case we specify that se is on top of base. !!!!!!!TODO!!!!!! If you want to better understand how compositions work, take a look at the [compositions](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples/compositions.ts) example in the [examples](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples) directory.

The se layer should contain Swedish content. Let's add it.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se.nodes[4] = { label: 4, value: str("äpple") };
  doc.layers.se.nodes[6] = { label: 6, value: str("banan") };
  doc.layers.se.nodes[8] = { label: 8, value: str("päron") };
});
```

To use the Swedish content we _project_ the se composition. Since se is on top of base its nodes will cover (overwrite) the base nodes.

To create a projection we call the `proj` function, which already has been present in the previous examples. The first parameter is the document and the second optional parameter is the composition. If no composition argument is passed the default composition is projected. A simple default composition is added to a document when it is created. It only contains the base layer, but can be edited if you wish to.

Let's log the se composition.

```javascript
out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter);
console.log("3.", out);
// ⇒ 3. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

If you project the default composition, the English strings will be projected as before.

## Disagreements

A disagreement is a safety mechanism that prevents you from project a value over an unexpected value. When you add a node you also add the value it expects to cover. Implicitly this is undefined.

We have already created disagreements. All of the nodes of se expects to cover an undefined value, but in fact they cover English content. Why are the disagreements hidden?

The answer lies in the `stringPresenter` function we previously, silently defined. This function evaluates a projection when passed to `treeOf` (TODO rename). If we want to display disagreements we need to pass a different function. Let's do it.

```javascript
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
```

Then pass this function to `treeOf`.

```javascript
out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("4.", out);
// ⇒ 4. [[»undefined ≠ apple → äpple«, 1], [»undefined ≠ banana → banan«, 2], [»undefined ≠ pear → päron«, 3]]
```

Now the disagreements are rendered the way we programmed in `stringPresenter2`.

Let's fix the disagreements, now that we have been shown they exist.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se.nodes[4] = {
    label: 4,
    value: str("äpple"),
    tracked: str("apple"),
  };

  doc.layers.se.nodes[6] = {
    label: 6,
    value: str("banan"),
    tracked: str("banana"),
  };

  doc.layers.se.nodes[8] = {
    label: 8,
    value: str("päron"),
    tracked: str("pear"),
  };
});
```

Then call `treeOf` with the projected se composition to verify the disagreemets are gone.

```javascript
out = treeOf(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("5.", out);
// ⇒ 5. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

Abmedium also have the concept of a simultaneity. They are created when values are added concurrently to the same node. Since Abmedium does not handle concurrency by itelf, simultaneities are meant to be used together with other libraries that does.

## Simultaneities

In addition to disagreements Abmedium also have the concept of simultaneities. A simultaneity is created when a node is updated concurrently.

## Examples

Inspect the [examples](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples) directory for more examples. [from-readme.js](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples/from-readme.js) contains all the examples in this document.

## Maturity Status

This package is not mature. It is not stable and will change a lot. It would be wonderful if you want to use it, but prepare for a bumpy ride. Maybe you want to [contribute](https://gitlab.com/berling/abmedium/-/blob/master/CONTRIBUTING.md) in that case?

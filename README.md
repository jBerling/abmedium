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
let fruits = Automerge.from(document<{}>());

fruits = Automerge.change(fruits, (doc) => {
  const base = doc.layers.base;
  base[0] = node(0, seq([1, 2, 3]), {});
  base[1] = node(1, seq([4, 5]), {});
  base[2] = node(2, seq([6, 7]), {});
  base[3] = node(3, seq([8, 9]), {});
  base[4] = node(4, str("apple"), {});
  base[5] = node(5, num(1), {});
  base[6] = node(6, str("banana"), {});
  base[7] = node(7, num(2), {});
  base[8] = node(8, str("pear"), {});
  base[9] = node(9, num(3), {});
});
```

This is a very cumbersome format. Don't be frightened! The library is meant to be used in the background and not manipulated directly as in this document.

To make sure we have not lost our content structure, let's rebuild it!

```javascript
const stringPresenter: NodePresenter<{}, string> = presNodeswitch({
  seq: (_, items) => `[${items.join(", ")}]`,
  str: (n) => `"${n.value}"`,
  _: (n: PresNode<any, string>) => String(n.value),
});

let out = pres(proj(fruits), stringPresenter);
console.log("1.", out);
// ⇒ 1. [(["apple", 1], ["banana", 2], ["pear", 3])];
```

There is a lot going on here. To begin with, let's talk about the elephant in the room. Why this strange structure?

One big reason is that every node get a handle. This way we can easily target specific nodes. This is handy when the document is edited, or if you want to link to a specific node. Remember, Abmedium is not a text medium. Therefore we need a way to pinpoint a specific place in the document the way you can point to a specific character at a specific line.

Another reason is that it let's us express other graphs than trees. The example above is a tree, but let's say we want to express a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).

```javascript
let dag = Automerge.change(document<{}>(), (doc) => {
  doc.layers.base[0] = { label: 0, value: seq(1, 1) };
  doc.layers.base[1] = { label: 1, value: str("same") };
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

## Nodes and NodeValues

There are six types of node values: nil, numbers, references, sequences, strings , and symbols. A NodeValue can be created using a three-letter function: `nil`, `num`, `ref`, `seq`, `str`, or `sym`. A Node is a NodeValue with some extra information. It has a label, metadata and possibly tracked values (more about that later). A Node can be created using the `node` function, as in the examples above. This is pretty verbose. Therefore there are some shorthand functions, named after the NodeValue type of the node with an `n`-suffix. For example, the shorthand for a string node is `strn`.

Instead of `node(0, str("foo"), {})` you can write `strn(0, "foo", {})`. We are going to use these shorthand functions in the rest of the examples.

## Layers and Projections

A document has layers. Nodes must be added to a layer, and can not be added to the document directly. So far we have only worked with one layer, the base layer. It is part of a document by default. Let's add another layer.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se = layer<{}>();
  doc.compositions.se = {
    label: "base",
    layers: [{ label: "se" }],
  };
});
```

Above we add a layer called se. We also add a _layer composition_, which is used to define the relation between layers. In this case we specify that se is on top of base.

The se layer should contain Swedish content. Let's add it.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4] = strn(4, "äpple", {});
  doc.layers.se[6] = strn(6, "banan", {});
  doc.layers.se[8] = strn(8, "päron", {});
});
```

To use the Swedish content we _project_ the se composition. Since se is on top of base its nodes will cover (overwrite) the base nodes.

To create a projection we call the `proj` function, which already has been present in the previous examples. The first parameter is the document and the second optional parameter is the composition. If no composition argument is passed the default composition is projected. A simple default composition is added to a document when it is created. It only contains the base layer, but can be edited if you wish to.

Let's log the se composition.

```javascript
out = pres(proj(fruits, fruits.compositions.se), stringPresenter);
console.log("3.", out);
// ⇒ 3. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

If you project the default composition, the English strings will be projected as before.

## Disagreements

A disagreement is a safety mechanism that prevents you from project a value over an unexpected value. When you add a node you also add the value it expects to cover. Implicitly this is undefined.

We have already created disagreements. All of the nodes of se expects to cover an undefined value, but in fact they cover English content. Why are the disagreements hidden?

The answer lies in the `stringPresenter` function we previously, silently defined. This function evaluates a projection when passed to `treeOf` (TODO rename). If we want to display disagreements we need to pass a different function. Let's do it.

```javascript
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
```

Then pass this function to `pres`.

```javascript
out = pres(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("4.", out);
// ⇒ 4. [[»undefined ≠ apple → äpple«, 1], [»undefined ≠ banana → banan«, 2], [»undefined ≠ pear → päron«, 3]]
```

Now the disagreements are rendered the way we programmed in `stringPresenter2`.

Let's fix the disagreements, now that we have been shown that they exist.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4] = strn(4, "äpple", {}, str("apple"));
  doc.layers.se[6] = strn(6, "banan", {}, str("banana"));
  doc.layers.se[8] = strn(8, "päron", {}, str("pear"));
});
```

Then call `pres` with the projected se composition to verify the disagreemets are gone.

```javascript
out = pres(proj(fruits, fruits.compositions.se), stringPresenter2);
console.log("5.", out);
// ⇒ 5. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

## Simultaneities

In addition to disagreements Abmedium also have the concept of simultaneities. A simultaneity is created when a node is updated concurrently. Abmedium relies on Automerge to keep track of concurrent updates.

Let's create a new document from the existing one. In a more realistic example this other document would live on another device (or at least another process).

```javascript
let fruits2 = Automerge.init<Document<{}>>();
fruits2 = Automerge.merge(fruits2, fruits);
```

Now update the original document.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4].value = "Äpple";
});
```

Then update the new document.

```javascript
fruits2 = Automerge.change(fruits2, (doc) => {
  doc.layers.se[4].value = "ÄPPLE";
});
```

Then merge the original with the copy.

```javascript
fruits = Automerge.merge(fruits, fruits2);
```

What we just did was to update the documents concurrently. It means both of the documents were updated without knowing the other one was updated. Depending on the context documents might go on for weeks without knowing what happens in other documents. Or they might know if a document is updated in less than a millisecond. Abmedium is designed to handle both contexts. If you cooperate tightly on a document, it is probably a good idea to work in the same layer, though you might want to shield yourself from others changes, and therefore place yourself in a sublayer. If documents are merged more seldom the changes should probably happen in different layers, and then perhaps merged into a superlayer.

Just as with disagreements you need to update the stringPresenter function, otherwise one of the simultaneous values will randomly be selected and the other ones silently discarded.

```javascript
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
```

Now let's render the document with the simultaneities visible inside of the curly brackets, as defined by `stringPresenter3`.

```javascript
out = pres(proj(fruits, fruits.compositions.se), stringPresenter3);
console.log("6.", out);
// ⇒ 6. [[{"Äpple" "ÄPPLE"}, 1], ["banan", 2], ["päron", 3]]
```

To get rid of the simultaneity just update the troublesome node again. In a real situation this means that you first have seen the simultaneity and then chosen the value you want to keep.

```javascript
fruits = Automerge.change(fruits, (doc) => {
  doc.layers.se[4].value = "Äpple";
});
```

Once again, run `proj` and `pres` and verify that the simultaneity is gone.

```javascript
out = pres(proj(fruits, fruits.compositions.se), stringPresenter3);
console.log("7.", out);
// ⇒ 7. [["Äpple", 1], ["banan", 2], ["päron", 3]]
```

## Examples

Inspect the [examples](https://gitlab.com/berling/abmedium/-/tree/main/packages/abmedium/examples) directory for more examples. [from-readme.js](https://gitlab.com/berling/abmedium/-/tree/main/packages/abmedium/examples/from-readme.js) contains all the examples in this document.

## Maturity Status

This package is not mature. It is not stable and will change a lot. It would be wonderful if you want to use it, but prepare for a bumpy ride. Maybe you want to [contribute](https://gitlab.com/berling/abmedium/-/blob/main/CONTRIBUTING.md) in that case?

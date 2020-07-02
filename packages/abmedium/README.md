# Abmedium

Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.

It is made for distributed editing in multilingual environments. A node can have values in different _layers_. Layers can be placed in a projection stack and projected. This way different projections can be created from one document. Projections can contain localized content, and emulate feature toggles/branches.

Layers can get in a conflict when they are projected in a stack. This is called a _disagreement_ and is one of the two types of conflicts Abmedium handles. The other type is _simultaneities_. They occur when a node is edited concurrently.

## Terminology

- _Handles_ are identifiers. They can be numbers or strings.
- _Layers_ are sets of nodes.
- _Metalayers_ are layers with data about nodes.
- _Nodes_ connects a handle with a value. A node is a handle–value pair.
- _Values_ are sequences, strings, symbols, numbers or nil.
- _Projections_ are created when a projection stack is projected.
- _Projection Stacks_ describes which layers, and in what order, to project.
- _Disagreements_ are created during a projection. They represent a mismatch between an expected and actual value.
- _Simultaneities_ are created when new values are added concurrently to the same node.

## Document Structure

Let's put the content `[["a", 1], ["b", 2], ["c", 3]]` into an Abmedium document.

```javascript
let doc = document({
  0: seq(1, 2, 3),
  1: seq(4, 5),
  2: seq(6, 7),
  3: seq(8, 9),
  4: str("a"),
  5: num(1),
  6: str("b"),
  7: num(2),
  8: str("c"),
  9: num(3),
});
```

This is a very cumbersome format. Just to make sure we have not lost our content structure, let's rebuild it.

```javascript
const stringPresenter = (value) =>
  valtype(value, {
    seq: ([, items]) => `[${items.join(", ")}]`,
    str: () => `"${value}"`,
    _: (v) => v,
  });

let out = treeOf(proj(treedoc), stringPresenter);
console.log("1.", out);
// 1. [["a", 1], ["b", 2], ["c", 3]]
```

There is a lot going on here. To begin with, let's talk about the elephant in the room. Why this strange structure?

One big reason is that every node get a handle. This way we can easily target specific nodes. This is handy when the document is edited, or if you want to link to a specific node.

Another reason is that it let's us express other graphs than trees. The example above is a tree, but let's say we want to express a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).

```javascript
onst dagdoc = document({
  0: seq(1, 1),
  1: str('a'),
});

out = treeOf(proj(dagdoc), stringPresenter);
console.log('2.', out);
// 2. ["a", "a"]
```

It is also an important part of how layers and projection works.

## Layers and Projections

A document has layers. Every layer is basically an object where every property represents a node. The property name is the handle, and the value is the ... value.

There are two types of layers: (ordinary) layers and metalayers. A layer is a set of nodes. So far we have only worked with one layer, the base layer which always is a part of a document. Let's add another layer.

```javascript
treedoc = {
  ...treedoc,
  se: layer({
    4: str("äpple"),
    6: str("banan"),
    8: str("päron"),
  }),
};
```

This layer contains Swedish translations. The `proj` function used above in the examples returns a projection. In a projection the layers in a projection stack is projected. The empty projection stack `[]` will only project the base layer. In the examples above this is what happened since the empty stack is passed by default. Let's pass a projection stack `["se"]` together with the document.

```javascript
out = treeOf(proj(treedoc, ["se"]), stringPresenter);
console.log("3.", out);
// 3. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

If you project it again with an empty stack, the English strings will be projected as before.

## Disagreements and Simultaneities

To add a safety mechanism that prevents you from project a value over an unexpected value, you add mappings instead of direct values. A mapping is created by calling `mapping` with two values. The first value is the value of the projected node. The second value is the expected value of the underlaying node.

```javascript
treedoc = {
  ...treedoc,
  se: layer({
    4: mapping(str("äpple"), str("apple")),
    6: mapping(str("banan"), str("banana")),
    8: mapping(str("päron"), str("pear")),
  }),
};
```

If an actual underlaying value equals the expected value the overlaying value will be projected.

```javascript
out = treeOf(proj(treedoc, ["se"]), stringPresenter);
console.log("4.", out);
// 4. [["äpple", 1], ["banan", 2], ["päron", 3]]
```

However, if the actual and expected value differ a disagreement will be projected.

```javascript
out = treeOf(proj({ ...treedoc, 4: str("lemon") }, ["se"]), stringPresenter);
console.log("5.", out);
// 5. [[»"apple" ≠ "lemon" → "äpple"«, 1], ["banan", 2], ["päron", 3]]
```

Abmedium also have the concept of a simultaneity. They are created when values are added concurrently to the same node. Since Abmedium does not handle concurrency by itelf, simultaneities are meant to be used together with other libraries that does.

## Examples

Inspect the [examples](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples) directory for more examples. [from-readme.js](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium/examples/from-readme.js) contains all the examples in this document.

## Maturity Status

This package is not mature. It is not stable and will change a lot. It would be wonderful if you want to use it, but prepare for a bumpy ride. Maybe you want to [contribute](https://gitlab.com/berling/abmedium/-/blob/master/CONTRIBUTING.md) in that case?

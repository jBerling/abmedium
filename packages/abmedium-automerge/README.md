# abmedium-automerge

This package combines [Abmedium](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium) with [Automerge](https://github.com/automerge/automerge). Abmedium will handle alternative views of the content (with the help of layers). Automerge will handle the complexity around distributed editing. It will also handle serialization.

## Document creation

Create a document.

```javascript
let docA = document({ 0: seq(1, 2, 3), 1: sym("+"), 2: num(100), 3: num(200) });
```

Create an empty document.

```javascript
let docB = document();
```

Merge documents as you do in Automerge.

```javascript
docB = merge(docB, docA);

console.log("1.", docB);
// 1. {
//     '0': [ 'seq', [ 1, 2, 3 ] ],
//     '1': [ 'sym', '+' ],
//     '2': 100,
//     '3': 200
// }
```

## Simultaneities

Let's update a document concurrently. (In a more realistic example this will of course happen in different processes.)

```javascript
docA = change(docA, (doc) => {
  doc[2] = 110;
  doc[3] = 220;
});

docB = change(docB, (doc) => {
  doc[2] = 111;
});

docB = merge(docB, docA);
```

In the background Automerge kept track of the causality and registered a conflict: node 2 has been edited concurrently. Therefore a simultaneity has been created.

```javascript
console.log("2.", docB);
// 2. {
//   '0': [ 'seq', [ 1, 2, 3 ] ],
//   '1': [ 'sym', '+' ],
//   '2': [ 'sim', [ 111, 110 ] ],
//   '3': 220
// }
```

## Txt

The str type in Abmedium is not suitable for collaborative work on longer content. Fortunately Automerge offers a data type that is: Text.

Let's create a Text value.

```javascript
let docC = document({ 0: txt("Hello!") });
```

It can be handled as other values in Abmedium. For example, `valtype` fully support it.

```javascript
console.log(
  "3. ",
  treeOf(proj(docC), (value) => valtype(value, { txt: () => value.toString() }))
);
// 3. Hello!
```

For further information, read about [Text](https://github.com/automerge/automerge#text) in Automerge.

## Examples

Inspect the [examples](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium-automerge/examples) directory for more examples. [from-readme.js](https://gitlab.com/berling/abmedium/-/tree/master/packages/abmedium-automerge/examples/from-readme.js) in that directory contains all the examples in this document.

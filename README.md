Abmedium Implementation
=======================

This directory contains an implementation of [Abmedium](../../abmedium/abmedium.md) using [δ-CRDTs](https://github.com/ipfs-shipyard/js-delta-crdts). 

How to use it
-------------

First import the things needed

``` javascript
const { proj, mapping, disagreement, Document, add, sync, value, root, sym } = require("@docly/medium");
```


Let's create an empty document.

``` javascript
const doc = Document("my-test-doc")
```

To create a graph of a list with a `+` symbol and the number 10 and 20

``` javascript
add(doc, root, [1, 2, 3]);
add(doc, 1, sym("+"));
add(doc, 2, 10);
add(doc, 3, 20);
```





Create a document
Add a node (composite, number, string, symbol)
pres
Create another document
Sync documents
Update doc
Sync
Update both docs
Sync
See disagreement or simultaneity?
Resolve
Add layer
Project
Add sibling layer
Project
Add sublayer
Project
pres

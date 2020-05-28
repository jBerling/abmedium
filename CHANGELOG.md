# Changelog

## 0.9

Big breaking changes.

- Remove dependency on delta-crdts
- Remove sync method on Document
- Remove dependency on uuids
- Rename pres to treeOf. It can now create a tree with a custom root
- add combined. It combines two documents. If two nodes binds a value to the same handle in the same layer they are considered to be overlapping. Then the value is resolved using a function passed as the first argument in a curried function.
- Add merge. It merges two documents. Conflicts are represented as Simultaneities. Uses combined under the hood.
- Add replace. It replaces the nodes of one document with the nodes of a second document. Uses combined under the hood.

## 0.8

- Add a new nil value type.

### 0.8.1

- export nil
- make isLayer check work with nil values
- present documents with nil as root

### 0.8.2

- Add editvalOf. It returns a value suitable to be edited.

### 0.8.3

First public release

- export editvalOf

## 0.7

Lots of breaking changes to the interface.

- Add lengthOf. It gets the lenght of a value. Meant to be used by an editor.
- valueTypeof is now valtype with alternative use by passing a flag.
- Remove isSym and isSequence
- Add str, num, and seq. Every value is now expected to be created by the use of str, num, seq or sym.

### 0.7.1

- lengthOf now throws a more meaningful error if no valtype of the passed value is found out.

## 0.6

- Parent and pos properties in parameter of pres

## 0.5

- Metalayers
- Rename node constructors to node presenters

## 0.4

- Add valueTypeof function to core.

## 0.3

- Add node constructor to `pres`.

## 0.2

- Serializing and deserializing.

## 0.1

- Basic implementation of the necessary features except deserialization.

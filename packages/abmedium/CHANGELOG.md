# Changelog

## 0.9.0

Big breaking changes.

- To multi-repo.
- Remove dependency on delta-crdts. Put CRDTs based functionality in new package @abrovink/abmedium-crdt. With this change this package will rely on other packages to handle causality. This decision can be seen as part of an experiment. How far can we go without CRDTs?
- Remove serialization.
- Remove dependency on uuids.
- Remove the Document type. Now we only work with objects. To handle an object as a document, the property with the name of the symbol abmedium/document need to be set to true.
- Remove all functionality related to update a document. This will be handled in other packages, for example by the new package @abrovink/abmedium-automerge.
- Rename pres to treeOf. It can now create a tree with a custom root.
- Export sim and add isSim.
- Change sim and seq to variadic functions.
- Add nodes, a function that returns an iterator from a layer.
- Add layers, a function that returns an iterator from a layer.
- Numerous other smaller changes ...

## 0.8.3

First public release

- export editvalOf

## 0.8.2

- Add editvalOf. It returns a value suitable to be edited.

## 0.8.1

- export nil
- make isLayer check work with nil values
- present documents with nil as root

## 0.8.0

- Add a new nil value type.

## 0.7.1

- lengthOf now throws a more meaningful error if no valtype of the passed value is found out.

## 0.7.0

Lots of breaking changes to the interface.

- Add lengthOf. It gets the lenght of a value. Meant to be used by an editor.
- valueTypeof is now valtype with alternative use by passing a flag.
- Remove isSym and isSequence
- Add str, num, and seq. Every value is now expected to be created by the use of str, num, seq or sym.

## 0.6.0

- Parent and pos properties in parameter of pres

## 0.5.0

- Metalayers
- Rename node constructors to node presenters

## 0.4.0

- Add valueTypeof function to core.

## 0.3.0

- Add node constructor to `pres`.

## 0.2.0

- Serializing and deserializing.

## 0.1.0

- Basic implementation of the necessary features except deserialization.

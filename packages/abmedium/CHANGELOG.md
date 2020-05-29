# Changelog

## 0.9.0

Big breaking changes.

- To multi-repo
- Remove dependency on delta-crdts. Put CRDTs based functionality in new package @abrovink/abmedium-crdt
- Remove serialization. Put serialization into @abrovink/abmedium-json
- Remove sync method on Document
- Remove dependency on uuids
- Rename pres to treeOf. It can now create a tree with a custom root
- Add combined. It is a curried function. It's first parameter is a function that resolves overlapping nodes. merged and replaced use it under the hood.
- Add merged. It combines two documents and resolves overlapping nodes into a simultainity.
- Add replaced. It combines two documents and resolves overlapping by replacing the value of the target document with the overlapping document.
- Add merged and replaced to Document.
- Export sim

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

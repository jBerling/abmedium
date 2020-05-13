# Changelog

## 0.7

Lots of breaking changes to the interface.

- lengthOf added to get the lenght of a value. Meant to be used by an editor.
- valueTypeof is now valtype with alternative use by passing a flag.
- isSym and isSequence removed
- str, num, seq added. Every value is now expected to be created by the use of str, num, seq or sym.

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

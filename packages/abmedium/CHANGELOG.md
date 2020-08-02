# Changelog

## 0.10.0

Once again big breaking changes. Migrate the project to TypeScript and make it support @abrovink/versioning.

- remove document, only use layers
- rename handles to labels
- Make proj work less strict. It now works even if a layer in a stack does not exist.
- Consider lables with `$` pre- and suffixes to be reserved for internal use by Abmedium.
- Replace mappings with a tracking layer.
- Put disagreements in a disagreement layer.
- valtype broken apart into valtype, valtypeIn and valswitch.
- removed editval
- add as<NodeType> functions
- Layers are now either ordinary layers or metalayers. It is no longer up to proj to decide that. A metalayer must have a label that is prefixed with `m$`.
- isLayer to asLayer and asMetalayer added.
- TODO `proj(layer1, layer2, ..., layerX)`
- TODO Refs (see 202008010757)
- TODO Refseqs (see 202008010757)

## 0.9.1

Big breaking changes. Make the scope of this package smaller.

- To multi-repo.
- Remove dependency on delta-crdts.
- Remove serialization. This should be placed in other packages, for example @abrovink/abmedium-automerge if is an Automerge document.
- Remove dependency on uuids.
- Remove the Document type. Now we only work with objects.
- Remove all update functionality. Let this be handled by @abrovink/abmedium-automerge.
- Rename pres to treeOf. It can now create a tree with a custom root.
- Rename equal to isEqual.
- Export sim and add isSim.
- Change sim and seq to variadic functions.
- Add nodes, a function that returns an iterator from a layer.
- Add layers, a function that returns an iterator from a layer.
- Reverse the parameter order of the mappings function. Change how mappings works a bit. A disagreement is now created if you try to project a mapping on a non-existing node, if the mapping does not expect it.
- Numerous other smaller changes ...

## 0.9.0

Lost in space. (Package was unpublished from NPM and a version number can not be reused)

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

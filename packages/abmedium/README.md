# Abmedium

Abmedium is a graph medium. Unlike text it can contain loops and nodes with multiple parents.

It is made for distributed editing in multilingual environments. A node can have values in different _layers_. Layers can be placed in a stack and projected. This way different projections can be created from one document.

Layers can get in a conflict when they are projected in a stack. This is called a _disagreement_ and is one of the two types of conflicts Abmedium handles. The other type is _simultaneities_. They occur when a node is edited concurrently.

## Terminology

- _Handles_ are identifiers. They can be numbers or strings
- _Layers_ are sets of nodes
- _Nodes_ connects a handle with a value
- _Values_
- _Projections_ are created when a projection stack is projected
- _Projection Stacks_

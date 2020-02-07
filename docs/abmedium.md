Abmedium
========

Background
----------
Programs are often created by a group of people, and developed in parallell _feature branches_. This shields the work in one feature branch from the transitional (messy) state in other ongoing branches. Finally, when a branch is ready, it is merged into a common branch. All this is handled in a version control system like Git.

An alternative (or complementary) way of working is to use _feature toggle/flags_. The idea is that all code belonging to a certain feature are disabled as long as a toggle is disabled. Toggles can of course also be used as a way to adapt a program for different circumstances, like customization. Toggles can be turned on/off statically or dynamically and can be implemented in many ways. 

Programs are also developed for a globalized world and need to be _localized_. This means there might be toggles in place for different languages and/or countries. There will also be different language strings which might interact with logic in complicated ways.

In this text we will describe a programming medium—_Abmedium_—that is developed for this world. It is designed to store content created by a distributed group of people. Content possibly written in many languages, with a history and configurable. And on top of that, content with conflicts to be solved in a possible future.

In other words, Abmedium is designed to handle the equivalence of feature branches, feature toggles, customization and localization. Not as an afterthought, but as a core feature.

The overwhelmingly predomant medium for programming code is text. Abmedium is different and its documents are directed acyclic graphs, designed to contain S-expressions.


### Abrovink
Abrovink is an experimental structural (programming) editor that mostly is a thought experiment so far. It will focus on collaboration and Abmedium is created with this editor in mind.

---

Core
----

### Syntax

_See [Notation](notation.md) for a description of the notation used in this document._

let $\Bbb{I}$ be some unspecified set of identifiers. 

Handles 

In $\Bbb{I}$ there is a special root identifier: $root \in \Bbb{I}$.

$$
\Bbb{H} = \{ x \mid x = root \lor x \in \Bbb{I} \}
$$

Values $\Bbb{V}$ are atoms $\Bbb{At}$ and sequences $\Bbb{Seq}$.

$$
\Bbb{V} = \mathbb{A}t \cup \Bbb{Seq}
$$

Atoms are either symbols $\Bbb{Sym}$, numbers $\natnums$ or strings $\Bbb{Str}$. 

$$
\Bbb{At} = \natnums \cup \Bbb{Sym} \cup \Bbb{Str}
$$

Sequences contains handles and nothing else.

$$
\Bbb{Seq} = \{(x_0, ..., x_n) \mid x \in \Bbb{H} \}
$$

### Document

A _document_, $\Bbb{D}$, is a set of handle – value mappings.

$$
\Bbb{D} = \{ f \mid f: \Bbb{H} \mapsto \Bbb{V} \}
$$

Let us introduce a notation for such a document. As an example, let $d$ be a document $\{ (root, (x, y, z)), (x, +), (y, 10), (z, 20) \}$. Then it would be written as

$$
\large d = \normalsize \begin{vmatrix}
   & (x, y, z) \\
   x & + \\
   y & 10 \\
   z & 20 \\
\end{vmatrix}
$$

The root handle is always written as the first mapping and can be implicit.

Several sequences can contain the same handle which makes it possible to represent other graphs than trees. For the rest of this document documents are expected to contain acyclic graphs. The format could contain cyclic graphs as well, but so far the consequences of this has not been analyzed.

### Presentations

To consume a document (either by a machine or a human) we need to assembly the graph (each pair is a  directed edge of a graph) into a more readable format — a _presentation_. The most obvious presentation would be created by replacing the handles in each sequence with the mapped value. When a document contains code, it will be presented before evaluated. 

__Definition (Presentation).__ _A presentation $pres$ is a function, which take a document $d$ as a parameter and returns an assembled structure where each identifier has been replaced by its mapped value.


Let $pres$ be a function so that

$$
pres(d) = (+, 10, 20)
$$

There might be other needs for other situations. One could also envision a situation where the handles would be preserved, maybe to be used by an editor. Let $lpres$ be a function so that

$$
lpres(d) = ((x, +), (y, 10), (z, 20))
$$

Later we will se other kinds of presentations. (Documents with comments, links, drafts and so on)

(I will also need to describe how presentations are functions from $D$ to $P$ or whatever that domain would be named. They are no longer $D$ anyway.)

### Fragments

Documents without a $(root, v)$ pair is called a _fragment_. A fragment can not be presented, but can have it use as we will see below when we extend the core. 


---

Content Layers
--------------

The core, described above, can not handle parallel content. This is a goal of the system. Therefore let us extend it so that a document can contain mappings from identifiers to documents.

Lets extend a _document_, $\Bbb{D}$, to be a set of mappings from handles to values, value-to-value mappings or other documents.

$$
\Bbb{D} = \{ f \mid f: \Bbb{H} \mapsto (\Bbb{D} \lor \Bbb{V}) \}
$$

Most likely an embedded document is a fragment. If it contains content (not data about content) it is a _replacement layer_. Its purpose is to contain alternative content and is used when a document is _projected_.

### Projection

When a document is projected layers can be added to a _projection stack_. It tells which layers to include and in which order. layers are projected on their parent layers, and the order of the sequence decides in which order the sibling planes are "projected" ... 

* conflicts
* language toggles
* feature toggles

#### Example 

Let there be a document $d$ with two content layers $x$ and $y$. $x$ in turn contains two content layers $y$ and $z$.

$$
\large d = \normalsize \begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 10 \\
   3        & 20 \\
   \\
   x  & \begin{vmatrix}
          2 & 100 \\
          3 & 200 \\ 
          \\
          y & \begin{vmatrix}
                3 & 400
              \end{vmatrix} \\ \\
          z & \begin{vmatrix}
                2 & 101
              \end{vmatrix}
        \end{vmatrix} \\ 
   \\
   y & \begin{vmatrix}
               3 & 300
             \end{vmatrix}
\end{vmatrix} \\ \\
$$

A projection with an empty projection stack will only include the _base layer_

$$
proj\{\Bbb{d}, ()\} = \Bbb{d}
$$

When only $y$ is in the stack

$$
proj\{\Bbb{d}, (y)\} = 
\begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 10 \\
   3        & 300 \\
\end{vmatrix}
$$

$x$ is in the stack

$$
proj\{\Bbb{d}, (x)\} = 
\begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 100 \\
   3        & 200 \\
\end{vmatrix}
$$

$x$ above $y$

$$
proj\{\Bbb{d}, (y, x)\} = 
\begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 100 \\
   3        & 200 \\
\end{vmatrix}
$$

$y$ above $x$

$$
proj\{\Bbb{d}, (x, y)\} = 
\begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 100 \\
   3        & 300 \\
\end{vmatrix}
$$

With sub layers

$$
proj\{\Bbb{d}, ((x, (y, z)))\} = 
\begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 101 \\
   3        & 400 \\
\end{vmatrix}
$$

---

Conflicts
---------



...

$$
\large d = \normalsize \begin{vmatrix}
   0        & (1, 2, 3) \\
   1        & + \\
   2        & 10 \\
   3        & 20 \\
   \\
   x  & \begin{vmatrix}
          2 & 10 \mapsto 100 \\
          3 & 20 \mapsto 200 \\ 
          \\
          y & \begin{vmatrix}
                3 & 200 \mapsto 300
              \end{vmatrix} \\ \\
          z & \begin{vmatrix}
                2 & 100 \mapsto 101
              \end{vmatrix}
        \end{vmatrix} \\ 
   \\
   y & \begin{vmatrix}
               3 & 20 \mapsto 300
             \end{vmatrix}
\end{vmatrix} \\ \\
$$

So far the system can not express conflicts. Let us change that and extend the document definition to handle two kinds of conflicts: Simultanieties $\Bbb{Sim}$ and Disagreements $\Bbb{Dis}$.

$$
\Bbb{Rep} = \Bbb{V} \mapsto \Bbb{V} \\
\Bbb{Dis} = banan \\ \\
\Bbb{Sim} = \{ x \mid x \in \Bbb{V} \} \\
\Bbb{D} = \{ f \mid f: \Bbb{H} \mapsto (\Bbb{V} \lor \Bbb{D} \lor \Bbb{Rep} \lor \Bbb{Sim} \lor \Bbb{Dis}) \} 
$$

__Definition (Simultaniety)__.
When a document is edited concurrently a _simultaniety_ is created. This is expressed by the use of a set of values. To resolve the conflict, just update the set with a value.

$$
\tag{simultaneity}
\begin{vmatrix}
   0 & (1, 2, 3) \\
   1 & + \\
   2 & \{100, 101, 200\} \\
   3 & 300 \\
\end{vmatrix}
$$


__Definition (Disagreement)__. When two content layers contain conflicting content. It arises when two layers updates the same content. It can also arise when an ancestor layer updates content already updated in a descendant layer.


$$
d = 
\begin{vmatrix}
   0 & (1, 2, 3) \\
   1 & + \\
   2 & 100 \\
   3 & 300 \\
   x & \begin{vmatrix}
         2 & 101 \mapsto 200 \\
         3 & 300 \mapsto 400
       \end{vmatrix} \\ \\
   y & \begin{vmatrix}
         3 & 300 \mapsto 401
       \end{vmatrix}
\end{vmatrix} 
\\ \\
proj(d, (x, y)) =
\begin{vmatrix}
   0 & (1, 2, 3) \\
   1 & + \\
   2 & 100 \not{\mapsto 200}  \\
   3 & 400 \not{\mapsto 401}
\end{vmatrix} 
$$

Even though a replacement layer disagrees with a parent layer, a third layer might resolve the disagreement if it is placed between the conflicting layers. The _projection order_ $(base, sub, sub2)$ is in agreement, but $(base, sub2)$ is in conflict.


$$
\tag{agreements}
\begin{vmatrix}
   0 & (1, 2, 3) \\
   1 & + \\
   2 & 100 \\
   3 & 300 \\ \\
   sub & \begin{vmatrix}
           3 & 300 \mapsto 400
         \end{vmatrix} \\ \\
   sub2 & \begin{vmatrix}
            3 & 400 \mapsto 401
          \end{vmatrix}
\end{vmatrix}
$$


The layers handles content that is deliberately created in parallel from other layers. For example, a layer might contain content in Swedish and another content in English.

---

Handles (extension?)
--------------------
(something about identifiers => handles)

$$
\Bbb{D} = \{(h, v) \mid h \in \Bbb{H}, v \in \Bbb{V} \}
$$

Handles, $\Bbb{H}$, are created automatically by an incrementer and will be a natural number. Handles can also be _named handles_ — a symbol. The $0$ handle is called the $root$.

$$
\Bbb{H} = \natnums \cup \Bbb{Sym}
$$

When a document is edited new handles will be created and older ones removed. If we can rely on older handles to never be recycled (at least automatically), we can rely on this in ways that is not possible using line/column coordinates in a conventional text based medium. The handle will not change if new content is added before it.


---

Meta Layers
-----------
By introducing the concept of a _meta layer_ data about the _content layers_ can easily be added to a document. A meta layer is not meant to replace content, but to add additional information about a layer.

As an example, lets say there is a meta layer $auth$. It contains the name of the author of each sub-graph.

$$
\large d = \normalsize \begin{vmatrix}
            & (a, b, c) \\
   a        & + \\
   b        & 10 \\
   c        & 20 \\
   \\
   d_{sub}  & \begin{vmatrix}
                a & 10 \mapsto 100 \\
                b & 20 \mapsto 200 \\
                auth & \begin{vmatrix}
                         a & doe \\
                         b & doe
                       \end{vmatrix}
              \end{vmatrix} \\ 
   \\
   auth     & \begin{vmatrix}
                  & berling \\
                c & doe
              \end{vmatrix}
\end{vmatrix}
$$

---

Document Hash
-------------



---
---
---
---
---

---

### Editing

Abmedium is meant to be edited by a team or single individual. The handles together with sequence indexes works as a way to precisely target where you want to change something. 

#### Operations

##### bind
Creates a new bond, or replaces an old bond with the same handle.

$$
\tag{bind}
\{(h_x, v) \}  
\xrightarrow{
    \normalsize bind(h_x, v')
} 
\{(h_x, v')\}
$$
-
$$
\tag{bind}
\begin{Vmatrix}
x & v \\ 
\end{Vmatrix}
\xrightarrow{
    \normalsize bind(h_x, v')
} 
\begin{Vmatrix}
x & v' \\ 
\end{Vmatrix}
$$

or

$$
\tag{bind}
\empty
\xrightarrow{
    \normalsize bind(h_x, v')
} 
\begin{Vmatrix}
x & v' \\ 
\end{Vmatrix}
$$

##### ins
Inserts a handle in $seq_t$ at position $n$.

$$
\tag{ins}
\{(h_x, seq)\}  
\xrightarrow{
    \normalsize ins(h_x, n)
} 
\{(h_x, seq')\}
$$

##### rem
Removes the handle in $seq_t$ at position $n$.

$$
\tag{rem}
\{(h_x, seq)\}  
\xrightarrow{
    \normalsize rem(h_x, n)
} 
\{(h_x, seq')\}
$$

##### prune
Hmm, I think I need a $prune$ function or something.

    prune{ (/1 /2) /1 inc /2 11 /3 111}
    => (/1 /2) /1 inc /2 11

##### name
Hmm, I think I need a $name$ function or something.

    name{ (/1 /2) /1 inc /2 11 } /1 /operator
    => (/operator /2) /operator inc /2 11

__Note__, abmedium does not handle selection and traversal.

### Manifestation
To truly act as a medium for code Abmedium needs a physical form that can be persisted. Maybe in a graph database? Or it could be serialized into ... text. Yeah, it is a bit ironic. But the big point here is that the text is abstracted away and not meant to be edited or read directly by a human. Though it is of course a good thing if it can be. It doesn't have to be optimized towards readability though.

### Handles vs Lines
Unlike a text document, an Abmedium document is not built of lines. To target a specic part of the document the handles are used instead. Unlike lines the handles are not stacked and a bond keep the same handle independent of other bonds being inserted or deleted. 

### Branchable (Planes)

Show how this work and show the difference between a conflict and a feature

Aspects:
- merging
- toggle on/off
  - statically
  - dynamically


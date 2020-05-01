# Abmedium

[Changelog](./CHANGELOG.md)

Abmedium is a graph medium. We want it to be an alternative medium to text for content that already is graphs, like programming languages and structured content.

It is an implementation of what's described more formally in [Abmedium – A Graph Medium](../../abmedium/abmedium.md) using [δ-CRDTs](https://github.com/ipfs-shipyard/js-delta-crdts). We believe Abmedium documents can be used as a solid foundation for distributed editing in complex multilangual environments, thanks to the power of graphs, CRDTs and the novel concepts of _disagreements_, _simultaneities_ and _layers_.

Let's explore how it works. You can create a file in this project and [run it in Node with the `--inspect-brk` flag](https://raygun.com/blog/node-debugger/) if you want to try out the code by yourself.

## Adding and Presenting

An Abmedium document is a container into which you add content in the form of _handle–value_ or _handle–layer_ mappings.

_Handles_ are either numbers or strings if they map to a value. If they map to a _layer_ they are always a string. Handles can also map to _simultaneities_ and _disagreements_.

_Values_ are built from four different kind of data types. The atomic ones are _numbers_, _strings_ and _symbols_. There is also a _sequence_ type.

Let's explore how to express the [S-expression](https://en.wikipedia.org/wiki/S-expression) `(+ 100 (- 200 300))`.

First import `@abrovink/abmedium`.

```javascript
const { proj, document, root, sym, pres } = require("@abrovink/abmedium");
```

Then create a document.

```javascript
const sexpr = document();
```

A complete document should contain a _root_ which is the `0` handle (hence the imported root is just a constant with the value `0`). Let's map the root to a sequence by calling `add`. The first argument is the handle and the second argument is the value.

```javascript
sexpr.add(root, [1, 2, 3]);
```

1, 2 and 3 are handles, because as mentioned above, a sequence can only contain handles. The handles should be mapped to `+`, `100` and `(- 200 300)`. First we add ...

```javascript
sexpr.add(1, sym("+"));
sexpr.add(2, 100);
```

... and then we add the subexpression `(- 200 300)`

```javascript
sexpr.add(3, [4, 5, 6]);
sexpr.add(4, sym("-"));
sexpr.add(5, 200);
sexpr.add(6, 300);
```

That's it! Seems like a pretty darn swift way of writing stuff! Right! Right? No, it's definitely not. Abmedium is designed to be hidden from the end user and edited through an editor. With that said, let's continue our journey.

To view the content enter

```javascript
sexpr.value();
```

The console will output something like this

```javascript
{
    0: [1, 2, 3],
    1: Sym{+},
    2: 100,
    3: [4, 5, 6],
    4: Sym{-},
    5: 200,
    6: 300
}
```

The value of the document is just an object of handles (the keys) and values. To "assemble" the graph use the function `pres`.

```javascript
pres(sexpr.value());
// => [Sym{+}, 100, [Sym{-}, 200, 300]]
```

At this point you might be asking yourself why Abmedium store the content in such a strange format. A part of the answer is that every value gets a handle. This is important since there are no lines, as in a normal text document. The handles can be used to point at a specific value, the way you can point at a specific line.

## Layers and Projections

So far we have worked with a single truth, but when you work with more complex content there is often a need to work with alternative truths. Programmers work with feature branches and/or feature toggles and localized content differs between locales.

Abmedium is designed to handle all these cases.

Let's begin to explore how a feature branch is handled, without the use of an additional version control system (like Git).

There is a system with a start view written in a language meant to be transpiled to HTML.

```javascript
const startView = document();
startView.add(root, [1, 2, 3, 7]);
startView.add(1, sym("div#start-view"));
startView.add(2, []);
startView.add(3, [4, 5, 6]);
startView.add(4, sym("h1"));
startView.add(5, []);
startView.add(6, "Hello, Sir!");
startView.add(7, [8, 9, 10, 14, 18]);
startView.add(8, sym("ul.menu"));
startView.add(9, []);
startView.add(10, [11, 12, 13]);
startView.add(11, sym("li.menu-item"));
startView.add(12, []);
startView.add(13, "Add article");
startView.add(14, [15, 16, 17]);
startView.add(15, sym("li.menu-item"));
startView.add(16, []);
startView.add(17, "Review article");
startView.add(18, [19, 20, 21]);
startView.add(19, sym("li.menu-item"));
startView.add(20, []);
startView.add(21, "Logout");
```

Before we continue, I just want to say something about the handles. The numeric handles are supposed to be created automatically, probably by an incrementer of some stuff, but they serve only as unique values and are not meant to order content. They are not meant to be consumed by a human since they will be abstracted away by an editor.

With that said, let's present the document to see what it contains.

```javascript
[Sym{div#start-view},
  [],
  [Sym{h1}, [], "Hello, Sir!"],
  [Sym{ul.menu},
    [],
    [Sym{li.menu-item}, [], "Add article"],
    [Sym{li.menu-item}, [], "Review article"],
    [Sym{li.menu-item}, [], "Logout"]]]
```

It looks like a really nice start page of a system where you apparently can add articles and review them.

Brutus is working on a feature branch – `"add-value-to-items"`. Until he as added any new content, the branch is just a name in his head, or possibly an editor. He ponders about it and then he adds some content.

```javascript
startView.add(["add-value-to-items", 22], "data-value");
startView.add(["add-value-to-items", 23], "add-article");
startView.add(["add-value-to-items", 12], [22, 23]);
startView.add(["add-value-to-items", 24], "data-value");
startView.add(["add-value-to-items", 25], "review-article");
startView.add(["add-value-to-items", 16], [24, 25]);
startView.add(["add-value-to-items", 26], "data-value");
startView.add(["add-value-to-items", 27], "logout");
startView.add(["add-value-to-items", 20], [26, 27]);
```

To add a value to a layer, you just pass an array containing the layer name and the handle to the `add` method instead of just a handle.

Let's inspect the document value.

```javascript
{
    0: [1, 2, 3, 7],
    1: Sym{div#start-view},
    2: [],
    3: [4, 5, 6],
    4: Sym{h1},
    5: [],
    6: "Hello, Sir!",
    7: [8, 9, 10, 14, 18],
    8: Sym{ul.menu},
    9: [],
    10: [11, 12, 13],
    11: Sym{li.menu-item},
    12: [],
    13: "Add article",
    14: [15, 16, 17],
    15: Sym{li.menu-item},
    16: [],
    17: "Review article",
    18: [19, 20, 21],
    19: Sym{li.menu-item},
    20: [],
    21: "Logout",
    "add-value-to-items": {
        12: [22, 23],
        16: [24, 25],
        20: [26, 27],
        22: "data-value",
        23: "add-article",
        24: "data-value",
        25: "review-article",
        26: "data-value",
        27: "logout"
    }
}
```

As you can see, the layer is mapped to the `add-value-to-items` handle. It is pretty much a document in the document.

If you try to present it by calling `pres(startView.value())` you will not see the new changes though. It's time to introduce a new concept: the projection. The idea is that you can project layers on top of each other. To project `add-value-to-items` on top of the base layer you use the `proj` function.

```javascript
proj(startView, ["add-value-to-items"]);
```

The call will produce the value

```javascript
0: [1, 2, 3, 7]
1: Sym{div#start-view}
2: []
3: [4, 5, 6]
4: Sym{h1}
5: []
6: "Hello, Sir!"
7: [8, 9, 10, 14, 18]
8: Sym{ul.menu}
9: []
10: [11, 12, 13]
11: Sym{li.menu-item}
12: [22, 23]
13: "Add article"
14: [15, 16, 17]
15: Sym{li.menu-item}
16: [24, 25]
17: "Review article"
18: [19, 20, 21]
19: Sym{li.menu-item}
20: [26, 27]
21: "Logout"
22: "data-value"
23: "add-article"
24: "data-value"
25: "review-article"
26: "data-value"
27: "logout"
```

As you can see, the values of `add-value-to-items` has replaced the base values. If you present this value you will get the expected value.

```javascript
pres(proj(startView, ["add-value-to-items"]));
```

The call will produce the value

```javascript
[Sym {name: "div#start-view"},
  [],
  [Sym{h1}, [], "Hello, Sir!"],
  [Sym{ul.menu},
    [],
    [Sym{li.menu-item},
      ["data-value", "add-article"],
      "Add article"],
    [Sym{li.menu-item},
      ["data-value", "review-article"],
      "Review article"],
    [Sym{li.menu-item},
      ["data-value", "logout"],
      "Logout"]]]
```

Nice! So far only one person has worked on the document. It's nice to be able to add different layers, but so far Abmedium seems a bit over-engineered for what it does. Let's introduce another contributor: Cato.

## Distributed Editing and Synchronization

Cato has been asked to translate the view to latin. He creates his own document.

```javascript
const startView2 = document();
```

Brutus and Cato has the strange habit of sharing computer and keyboard while working, but normally you of course work on different computers.

To fill it with content, he syncs with Brutus' document.

```javascript
startView2.sync(startView._ormap.state());
```

If you inspect the value of `startView2` you will see it matches the value of `startView`. Now Cato starts his work. He translates the heading.

```javascript
startView2.add(["la", 6], "Salve magister!");
```

He checks the result together with Brutus changes.

```javascript
pres(proj(startView2, ["add-value-to-items", "la"]));
```

The call will produce the value

```javascript
[Sym{div#start-view},
  [],
  [Sym{h1}, [], "Salve magister!"],
  [Sym{ul.menu},
    [],
    [Sym{li.menu-item},
      ["data-value", "add-article"],
      "Add article"],
    [Sym{li.menu-item},
      ["data-value", "review-article"],
      "Review article"],
    [Sym{li.menu-item},
      ["data-value", "logout"],
      "Logout"]]]
```

As he expected, the heading has been translated, while the other language strings still are in English. When Brutus sees this he takes the opportunity to sync with Cato's changes.

```javascript
startView.sync(startView2._ormap.state());
```

Now, think about what happened here. Brutus and Cato are working on different feature branches, but can still see and react to each others changes while they happen. This differs a lot from the way you work in a traditional versioning system like Git, where it's quite easy to get trapped in a silo (perhaps you get really inspired and forget to rebase/merge for days) only to experience difficult merge conflicts when it is time to ship the feature. It can also be a challenge to work tightly with someone else if you rely on the versioning system to synchronize your work. Maybe this is a reason to why developers have a tendency (anectdotally speaking) to work as lone wolfs on a task till it's ready.

Cato continues his work and translates the rest of the items.

```javascript
startView2.add(["la", 13], "Articulus addendi");
startView2.add(["la", 17], "Articulus criticis");
startView2.add(["la", 21], "Apage");
```

Once again he inspects the results and feel content when everything works as expected. He leaves the computer and hopes nobody will really inspect his shaky translations.

## Mapping and Disagreements

Brutus gets back to the computer and synchronize with Cato's work. He then starts on another feature. Apparently someone thought it would be a good idea to present the name of the user when hailing them. To do this, he will wrap the whole view in a function with a parameter `user-name`.

```javascript
startView.add(["hail-by-name", 28], sym("fun"));
startView.add(["hail-by-name", 29], [30]);
startView.add(["hail-by-name", 30], sym("user-name"));
startView.add(["hail-by-name", 31], [1, 2, 3, 7]); // the old root
startView.add(["hail-by-name", root], [28, 29, 31]);
```

He inspects the result

```javascript
pres(proj(startView, ["add-value-to-items", "la", "hail-by-name"]));
```

The call will produce the value

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1}, [], "Salve magister!"],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

When inspecting the value Brutus realized he forgot to use the parameter in the function body. He fixes his mistake

```javascript
startView.add(["hail-by-name", 32], sym("concat"));
startView.add(["hail-by-name", 33], "Hi ");
startView.add(["hail-by-name", 34], sym("user-name"));
startView.add(["hail-by-name", 35], "!");
startView.add(["hail-by-name", 6], [32, 33, 34, 35]);
```

He presents the projected value

```javascript
pres(proj(startView, ["add-value-to-items", "la", "hail-by-name"]));
```

The call will produce the value

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
             [],
             [Sym{concat}, "Hi ", Sym{user-name}, "!"]],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

The "la" and "hail-by-name" layers have changed the same content, namely the value of handle `6`. `"Salve magister!"` has been replaced with `[Sym{concat}, "Hi ", Sym{user-name}, "!"]`, without any warning! If Abmedium is going to behave like this, it is not to be trusted!

Before we come up with a solution to the problem, let's take a look at the order of the layers passed to `proj`. The order matters a lot. If we change the order, so that "la" comes after "hail-by-name" the result will differ. The call

```javascript
pres(proj(startView, ["add-value-to-items", "hail-by-name", "la"]));
```

will produce the value

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
             [],
             "Salve magister!",
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

Now it is `"Salve magister!"` that wins! The rule is thus: a layer will be projected on top of preceding layers and cover conflicting values.

Ok, enough about _projection order_ and let's focus on conflicts not being detected. In a three way merge the conflict would have been detected by the fact that both layers change the same content (value of handle `6`). Abmedium works differently.

When you add a value to a layer you can add the value you expect the node to have in the underlying layer. We inform Cato about this and he updates the "la" layer.

```javascript
startView2.add(["la", 6], "Salve magister!", "Hello, Sir!");
startView2.add(["la", 13], "Articulus addendi", "Add article");
startView2.add(["la", 17], "Articulus criticis", "Review article");
startView2.add(["la", 21], "Apage", "Logout");
```

Let's see if this changes anything. Brutus synchronizes the documents and present the projection

```javascript
startView.sync(startView2._ormap.state());
pres(proj(startView, ["add-value-to-items", "hail-by-name", "la"]));
```

which will produce

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
            [],
            Disagreement{
                expected: "Hello, Sir!",
                actual: [Sym{concat}, "Hi ", Sym{user-name}, "!"],
                to: "Salve magister!"
            }],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

This result introduces _Disagreements_, which is one of the conflict types. As you can see, the Disagreement knows what value to expect, which it as and what to change it to. To solve the disagreement just add a new value which expects the right value. Brutus tells Cato to resolve the conflict, which Cato does by calling

```javascript
startView2.add(["la", 33], "Salve ");
startView2.add(["la", 6], [32, 33, 34, 35], [32, 33, 34, 35]);
```

This will do the trick. After some pondering Cato also adds

```javascript
startView2.add(["la", 32], sym("concat"), sym("concat"));
startView2.add(["la", 34], sym("user-name"), sym("user-name"));
startView2.add(["la", 35], "!", "!");
```

Though strictly not needed to produce the wanted result for now, the last content added to "la" will result in a conflict if those are changed in the base layer.

Brutus synchronizes with his document to see the result. Once again

```javascript
startView.sync(startView2._ormap.state());
pres(proj(startView, ["add-value-to-items", "hail-by-name", "la"]));
```

And now he gets the wanted result

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
            [],
            [Sym{concat}, "Salve ", Sym{user-name}, "!"],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

There is something funky in the way Cato and Brutus uses the layers though. It's not a good sign when two layers are changing the same content, and while disagreements help us to discover unexpected clashes they also make layers dependent on each other. Let us explore why this can be a problem and also what we can do to handle things a bit differently.

Cato and Brutus realizes the different layers are used for different purposes. "add-value-to-items" is a bug fix and the changes are meant to be added to the base layer when the testers have tested they work as intended. "hail-by-name" implements a feature that will be used in an A/B test. By turning the layer on and of when projecting the document it will act as a feature toggle. Lastly, "la" is a language layer and is expected to live as long as Latin is supported in the system.

Currently things will not work as expected when you turn on/off "hail-by-name". If you turn it off there will be a disagreement with the "la" layer. This is not acceptable.

Instead we can use _sub-layers_. That is right, layers can contain layers. When Cato is told about sub-layers he updates the document.

```javascript
startView2.add(["la", 6], "Salve magister!", "Hello, Sir!");
startView2.add(["hail-by-name", "la", 33], "Salve ");
startView2.add(["hail-by-name", "la", 6], [32, 33, 34, 35], [32, 33, 34, 35]);
startView2.add(["hail-by-name", "la", 32], sym("concat"), sym("concat"));
startView2.add(["hail-by-name", "la", 34], sym("user-name"), sym("user-name"));
startView2.add(["hail-by-name", "la", 35], "!", "!");
```

He ones again adds the original translation `"Salve magister!"` and then add changes to the sub-layer.

First Brutus synchronizes and then he check the translations of the base layer.

```javascript
startView.sync(startView2._ormap.state());
pres(proj(startView, ["la"]));
```

He verifies the result looks as expected.

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
            [],
            [Sym{concat}, "Salve ", Sym{user-name}, "!"],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item}, [], "Articulus addendi"],
            [Sym{li.menu-item}, [], "Articulus criticis"],
            [Sym{li.menu-item}, [], "Apage"]]]]
```

Then he turns on the "hail-by-name" layer.

```javascript
pres(proj(startView, ["la", ["hail-by-name", ["la"]]]));
```

It works as expected.

```javascript
[Sym{fun},
    [Sym{user-name}],
    [Sym{div#start-view},
        [],
        [Sym{h1},
            [],
            [Sym{concat}, "Salve ", Sym{user-name}, "!"],
        [Sym{ul.menu},
            [],
            [Sym{li.menu-item},
                ["data-value", "add-article"],
                "Articulus addendi"],
            [Sym{li.menu-item},
                ["data-value", "review-article"],
                "Articulus criticis"],
            [Sym{li.menu-item},
                ["data-value", "logout"],
                "Apage"]]]]
```

The way the projection order is declared is a bit hard to read for a human. Implicitly all the layers are sub-layers to the base layer. Earlier we declared the projection order `["add-value-to-items", "hail-by-name", "la"]`. If the base layer would have been declared explicitly, it would have looked like

```javascript
["base", ["add-value-to-items", "hail-by-name", "la"]];
```

The siblings are added together in an array. If you want to project the sub-layers of a layer, you put the name of the layer as the first item of an array and its sub-layers in another array. Let's say we turn on "la" and "se" in "hail-by-name". The projection order above would then be changed to

```javascript
["base", ["add-value-to-items", ["hail-by-name", ["la", "se"]], "la"]];
```

This would not work though, since "base" is implicitly added. Remove it to produce a valud projection order

```javascript
["add-value-to-items", ["hail-by-name", ["la", "se"]], "la"];
```

### A Word About the Current Implementation of Layers and Projections

Abmedium is still very young. Exactly how Disagreements should work is not yet figured out, and a lot of trial-and-error will be needed. It is probably a safe bet to say that we will remove the current way of just ignoring conflicts if we don't pass an expected value to change from. We could for example always create a Mapping (by demanding a third argument to `add`) or treat changes of the same node as a conflict if there is no Mapping.

The projection order is also a bit cumbersome to work with. One could think of the possibility to turn on all sub-layers, or layers matching a pattern, like

```javascript
// Not implemented, it's just an idea
proj(doc, [
  ["foo", "*"],
  ["bar", "language*"],
]);
```

Before implementing something like this, there are still some questions to answer. Will a pattern only be applied only to the children or all descendants? What will decide if a layer is projected on top of or below a sibling that also matches a pattern?

### A Word About Branching

Layers are not branches. If you truly want to create a branch, let's say you want something like a feature branch. Then you just create a new document and synchronize it with the latest content and continue on it, without synching with the main branch which will contain changes belonging to things not belonging to the release, while you can continue to add bug fixes to your release document.

## Simultaneities

Cato realizes he has not synchronized his document in a long time. He synchronizes and then makes a change in "la"

```javascript
startView2.sync(startView._ormap.state());
startView2.add(["la", 6], "Salve, Magister!", "Hello, Sir!");
```

Then Brutus make a change in "hail-by-name", and synchronizes after.

```javascript
startView.add(["hail-by-name", 30], sym("user"));
startView.add(["hail-by-name", 34], sym("user"));
startView.sync(startView2._ormap.state());
```

Brutus inspects the document value and everything looks nice. Then Cato also synchronizes and verifies everything looks as it should in his document as well. Even though they added content without being synchronized everything worked well, because the didn't change the same content.

Then they both, for some reason, decides to change the id of the root div.

First Brutus changes it

```javascript
startView.add(1, sym("div#startView"));
```

and then Cato changes it

```javascript
startView2.add(1, sym("div#start"));
```

Brutus synchronizes and presents the document

```javascript
startView.sync(startView2._ormap.state());
pres(startView.value());
```

When he inspects the value he can see there is a set containing both his and Cato's change. The set is what Abmedium calls a _simultanity_. A simultanity is created when a value is changed concurrently. Simultanities is one of the types of conflicts handled by Abmedium. (The other one is disagreements.)

```javascript
[Set{Sym{div#startView}
     Sym{div#start}},
  [],
  [Sym{h1}, [], "Hello, Sir!"],
  [Sym{ul.menu},
    [],
    [Sym{li.menu-item}, [], "Add article"],
    [Sym{li.menu-item}, [], "Review article"],
    [Sym{li.menu-item}, [], "Logout"]]]
```

Brutus favors Cato's change and resolves it by adding it to the document.

```javascript
startView.add(1, sym("div#start"));
```

Then Cato synchronizes and for him the simultanity is never seen.

## Deltas

In this documentation we have manually synched documents locally. This is a very artificial situation. The documents are designed to be synchronized automatically, continuously and remotely. Since Abmedium is built on top of δ-CRDTs we don't have to send the whole document to synchronize. We only need to send the deltas. A delta is returned every time content is added.

A more realistic example, than in the examples above, would look something like this, using some kind of algorithm to broadcast the changes to potentially a lot of machines, not only two as above.

```javascript
// on machine A
const changeSet = [];
changeset.push(add(doc, root, [1, 2]));
changeset.push(add(doc, 1, "foo"));
changeset.push(add(doc, 2, "bar"));
broadcast(changeset);
```

```javascript
// on machine B, ..., X
onDeliver((changeset) => doc.sync(changeset));
```

## (De)Serializing

You can serialize a document using the `serialized` function. If you pass a document to it, the document state will be serialized. You should not expect it to be in a very readable format though.

```javascript
const state = serialized(doc);
```

If you deserialize the document it will be revived as a document again

```javascript
const doc2 = deserialized(state);
```

Since we are working with δ-CRDTs, you can also serialize a delta.

```javascript
const changeset = [];
changeset.push(doc.add(1, "humle"));
changeset.push(doc.add(2, "humle"));
const serializedChangeset = serialized(changeset);
```

And of course, you can then synchronize with a document from the serialized data.

```javascript
deserialized(serializedChangeset).forEach((delta) => doc2.sync(delta));
```

## Metalayers and Node Presenters

One of the nice aspects of Abmedium is that every node has a handle. This fact can be used by a metalayer. A metalayer is a sublayer and contains data about the nodes in its parent layer. It is created in the same way as other sublayers.

```javascript
const exp = document();
exp.add(0, [1, 2, 3]);
exp.add(["type", 0], sym("expr"));
exp.add(1, sym("+"));
exp.add(["type", 1], "func");
exp.add(2, 100);
exp.add(["type", 2], "int");
exp.add(3, 200);
exp.add(["type", 3], "int");
```

To use the `type` layer as a metalayer you pass in a third argument to `proj`, `proj(exp, [], ["type"])`. The projection will then contain they metalayer as well.

```javascript
0: [1, 2, 3]
1: Sym{+}
2: 100
3: 200
type: 0: Sym{expr}
      1: Sym{func}
      2: Sym{int}
      3: Sym{int}
```

So far, when we have called `pres`, we have presented the values directly. `pres` is more powerful than that though. You can pass a Node Presenter as the second argument. It's a function with the parameters `value`, `handle` and `metadata` and it returns whatever value you want presented. The `metadata` argument are built from the metadata layers. This is what it could look like.

```javascript
pres(proj(exp, [], ["type"]), (value, handle, { type }) => ({
  value,
  handle,
  type,
}));
```

Which would produce

```javascript
{
    handle: 0,
    type: Sym{expr},
    value: [
        { handle: 1, type: Sym{func}, value: Sym{+} },
        { handle: 2, type: Sym{num}, value: 100 },
        { handle: 3, type: Sym{num}, value: 200 }
    ]
}
```

## What's Missing?

### Timestamps and Authors

To keep track of who has written what and when there shall be a way to save this in the document. Perhaps they can be stored in a changelog or in a metalayers.

### Fragments

Fragments (documents not necessarily having a root) could be used to add content to several documents. If the handles are globally unique (hashes or UUIDs) this could potentially be very powerful.

The changelog rapidly grows in size. Perhaps Fragments could be used in an attempt to keep the log smaller. If a feature is developed in a fragment it can then be merged into a published document when it is ready with a merged history.

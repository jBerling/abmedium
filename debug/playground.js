// First import the things needed
const { proj, mapping, disagreement, document, root, sym, pres } = require("..")

// Let's create an empty document.
const doc = document()

// Add a list of a symbol and two numbers
doc.add(root, [1, 2, 3]);
doc.add(1, sym("+"));
doc.add(2, 10);
doc.add(3, 20);

// ## Adding and Presenting
// To see the value of the document call value
doc.value();
// => 
// {
//   0: [1, 2, 3]
//   1: Sym {name: "+"},
//   2: 10,
//   3: 20
// } 

// An "assembled" graph can be created by calling
pres(doc.value());
// => [Sym(+), 10, 20]


// ## Layers and Projections (and Disagreements?)
// Let's say we want an alternative value for the 3-node
// We can do this by adding a layer, let's call it alt
doc.add(["alt", 3], 200);

// The value of the doc is now a bit more complicated
doc.value();
// =>
// {
//   0: [1, 2, 3]
//   1: Sym {name: "+"},
//   2: 10,
//   3: 20,
//   alt: {
//     3: 200
//   },
// }

// Let's present it
pres(doc.value())
// => [Sym(+), 10, 20]
// ... but, it's the same as before?

// To get access to the new layer, we need to project it
// over the base layer.
proj(doc, ["alt"])
// => {
//   0: [1, 2, 3],
//   1: Sym {name: "+"},
//   2: 10,
//   3: 200
// }
//
// The projection has merged the layers into one

// Layers can be nested
doc.add(["alt", "sub-alt", 3], 2000)
// =>
// {
//   0: [1, 2, 3]
//   1: Sym {name: "+"},
//   2: 10,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2000
//     }
//   },
// }
// To project a layer and a sub-layer a construction 
// of arrays is used. The unintuitive nesting is needed
// to distinguish between sibling and child layers.
proj(doc, [["alt", ["sub-alt"]]])
// => {
//   0: [1, 2, 3],
//   1: Sym {name: "+"},
//   2: 10,
//   3: 2000
// }

// Add an example of disagreement here


// ## Synchronizing

// Create a new document
const doc2 = document()

// Pretend doc is edited by Gusten and doc2 by Sixten.
// Sixten want doc2 to contain all the stuff Gusten has added to doc.
// To do this, the documents are synchronized.
doc2.sync(doc._ormap.state())

// Now doc2 contains all the things doc contained when the docs where synced.
doc2.value()
// => 
// {
//   0: [1, 2, 3]
//   1: Sym {name: "+"},
//   2: 10,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2000
//     }
//   },
// }

// Normally you don't want to send a whole document in order to distribute content changes.
// Since Abmedium is built on top of Delta-CRDTs you only have to send the change.
const delta = doc.add(["alt", "sub-alt", 3], 2222)
doc2.sync(delta)

doc2.value()
// => 
// {
//   0: [1, 2, 3]
//   1: Sym {name: "+"},
//   2: 10,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2222
//     }
//   },
// }

// ## Conflicts (Simultaneities and Disagreements)

// Abmedium differs between conflicts. There are simultaneities and disagreements.
// A simultaneity happens if the same mapping in a document is edited concurrently.

// Let's try to edit a mapping and sync it
doc.add(2, 11)
doc2.add(1, sym("-"))
doc2.sync(doc._ormap.state())
doc2.value()
// => 
// {
//   0: [1, 2, 3]
//   1: Sym {name: "-"},
//   2: 11,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2222
//     }
//   },
// }

// Ok, nothing special there. Now, let's create a simultaneity
doc.add(1, sym("/"))
doc2.add(1, sym("+"))
doc2.sync(doc._ormap.state())
doc2.value()
// => 
// {
//   0: [1, 2, 3]
//   1: Set {Sym {name: "+"}, Sym {name: "/"}},
//   2: 11,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2222
//     }
//   },
// }

// Since we edited the same mapping simultaneously, we create a simultaneity.
// It is implemented as a Set containing the concurrent values.
// In this case there are only two conflicts values, but potentially it could contain 
// as many values as the number of synchronized documents.
// To resolve the conflict, just add a value
doc2.add(1, sym("+"))
doc2.value()
// => 
// {
//   0: [1, 2, 3]
//   1: {name: "+"},
//   2: 11,
//   3: 20,
//   alt: {
//     3: 200,
//     sub-alt: {
//       3: 2222
//     }
//   },
// }

// The other kind of conflict is a disagreement, and this does not happen
// because the document have not been synched. This happens because the editors
// have conflicting minds about the values. A disagreement can not happen in one layer,
// because then it is a simultaneity. It can only happen between layers. Layers are
// really powerful and can be used to contain features (and used both as a feature branch
// and a feature toggle), different languages, version branches and other different views 
// of a document.

// Let's create a disagreement. If you feel like it, you can create a disagreement with yourself.
// Sometimes you want to try out different solutions. Let's create a new document.
const doc3 = document()
doc3.add(1, sym("do-something"))
doc3.add(2, "jump")
doc3.add(root, [1, 2])
doc3.add(["a", 2], "walk", "jump")
doc3.add(2, "run")

doc3.value()
// =>
// {
//   0: [1, 2],
//   1: Sym {name: "do-something"}
//   2: "run"
//   a: {
//     2: Mapping {from: "jump", to: "walk"}
//   }
// }

// We have created our first disagreement. When we added "walk" to the layer a with the handle 2.
// The extra argument "jump" tells as we expect the value to the parent mapping to be "jump".
// But since then the value has changed to "run".
proj(doc3, ["a"])
// =>
// {
//   0: [1, 2],
//   1: Sym {name: "do-something"},
//   2: "run",
//   a: Disagreement {
//     to: "walk",
//     expected: "jump",
//     actual: "run"
//   }
// }

// To resolve a disagreement, you change the expected and actual values to match each others,
// most probably you change the expected value to match the actual one. A mismatch is a signal
// that means your changes are based on a historical value. If you are developing a new feature
// it's important to know that your changes are based on fresh assumptions. 

// Another use of layers could be for different language implementations.

// Let's create an example. A text, where every sentence is a node.
const doc4 = document()
doc4.add(root, [1, 2, 3])
// doc4.add(1, "")
// doc4.add(2, "")
// doc4.add(3, "")

// First we add the English sentences
doc4.add(["en", 1], "The sole purpose of the plan is to avoid him.") 
doc4.add(["en", 2], "Benny Mason, he is probably the most hate filled juvenile there is.") 
doc4.add(["en", 3], "He hates everyone, he hates the school but most of all he hates me.")

// Then we add the Swedish translations
doc4.add(
  ["en", "se", 1], 
  "Hela syftet med planen är att undvika honom.", 
  "The sole purpose of the plan is to avoid him."
)
doc4.add(
  ["en", "se", 2], 
  "Benny Mason, antagligen den mest hatiska ynglingen som finns.", 
  "Benny Mason, he is probably the most hate filled juvenile there is."
)
doc4.add(
  ["en", "se", 3], 
  "Han hatar alla, han hatar skolan men mest av allt hatar han mig.",
  "He hates everyone, he hates the school but most of all he hates me."
)

// Then the original English text is updated
doc4.add(["en", 1], "I had one thing on my mind, to avoid him.")

// The disagreement tells us our Swedish translation is based on an old version of the text.
// This way one can easily think of ways to alert a translator of new work to be done.
// The layer hierarchy also tells us that the Swedish texts are based on the English ones.
proj(doc4, [["en", ["se"]]])
// => {
//   0: [1, 2, 3],
//   1: Disagreement {
//        expected: "The sole purpose of the plan is to avoid him.",
//        actual: "I had one thing on my mind, to avoid him.",
//        to: "Hela syftet med planen är att undvika honom."
//      },
//   2: "Benny Mason, antagligen den mest hatiska ynglingen som finns.",
//   3: "Han hatar alla, han hatar skolan men mest av allt hatar han mig."
// }

// The layers can also be used as feature toggles.
const doc5 = document()
doc5.add(root, [1, 2, 3]);
doc5.add(1, sym("+"));
doc5.add(2, 10);
doc5.add(3, 20);
doc5.add(["division", 1], sym("/"), sym("+"))

// To activate the toggle, project the document with the division layer on
pres(proj(doc5, ["division"]))
// => [Sym {name: "/"}, 10, 20]

// To deactivate the toggle, just project with the division layer off
pres(proj(doc5))
// => [Sym {name: "+"}, 10, 20]

// Let's take a look at sibling layers. First create a document and some content.
const doc6 = document()
doc6.add(root, [1, 2])
doc6.add(1, "one")
doc6.add(2, "two")
doc6.add(["a", 1], "a-one")
doc6.add(["b", 2], "b-two")
doc6.add(["b", 1], "b-one")

// Then present it. To project several layers add them as items in the same array.
// The succeeding layer is projected over the preceeding one.
pres(proj(doc6), ["a", "b"]);
// => ["b-one", "b-two"]

pres(proj(doc6), ["b", "a"]);
// => ["a-one", "b-two"]

// This is a little dangerous. We might override a value by mistake. Though strictly
// sublayers are meant to implement dependencies between layers, you can also add a 
// dependency by expecting a previously projected layer contains a specific value.
doc6.add(["b", 1], "b-one", "a-one")

pres(proj(doc6), ["a", "b"]);
// => ["b-one", "b-two"]

pres(proj(doc6, ["b"]))
// => [Disagreement {expected: "a-one", actual: "one", to: "b-one"}, "b-two"]

// But unfortunately ...
pres(proj(doc6, ["b", "a"]))
// => ["a-one", "b-two"]

doc6.add(["a", 1], "a-one", "one");
pres(proj(doc6, ["b", "a"]));
// => [
//   Disagreement {
//     expected: "one", 
//     actual: Disagreement {expected: "a-one", actual: "one", to: "b-one"}, 
//     to: "a-one"
//   }, 
//   "b-two"
// ]

// If you add a value to a layer without an expected from value, you are really
// side-stepping the safety mechanisms.

debugger;

// Explore concurrent editing
// Let's create a new document
const fragment = document();

// add a node
fragment.add(2, 100)

// as expected its value can be called for
value(fragment)
// => error: A fragment can not be presented. The document has no root.

// Ok, you need a root (a node with the handle 0) for
// a presentable document. Is a fragment useless then?




// Create another document
// Sync documents
// Update doc
// Sync
// Update both docs
// Sync
// See disagreement or simultaneity?
// Resolve
// Add layer
// Project
// Add sibling layer
// Project
// Add sublayer
// Project
// pres




debugger
console.log("Finished")
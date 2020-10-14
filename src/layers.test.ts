import { numn, symn, layer } from "./core";
import { layers } from "./layers";
import { document } from "./document";
import Automerge from "automerge";

test("layers", () => {
  let doc = Automerge.change(Automerge.from(document<{}>()), (doc) => {
    doc.layers.base.a = symn("a", "A", {});
    doc.layers.base.two = numn("two", 2, {});
    doc.layers.c = layer<{}>({ a: symn("a", "AA", {}) });
    doc.layers.d = layer<{}>({ a: symn("a", "a", {}) });
  });

  expect([...layers(doc)]).toMatchObject([
    {
      a: symn("a", "A", {}),
      two: numn("two", 2, {}),
    },
    {
      a: symn("a", "AA", {}),
    },
    {
      a: symn("a", "a", {}),
    },
  ]);
});

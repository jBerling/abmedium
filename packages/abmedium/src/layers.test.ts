import { num, sym, layer } from "./core";
import { layers } from "./layers";
import { document } from "./document";
import Automerge from "automerge";

describe("layers", () => {
  it("return layers but not nodes", () => {
    let doc = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base.a = { label: "a", value: sym("A") };
      doc.layers.base.two = { label: "two", value: num(2) };
      doc.layers.c = layer<{}>({ a: { label: "a", value: sym("AA") } });
      doc.layers.d = layer<{}>({ a: { label: "a", value: sym("a") } });
    });

    expect([...layers(doc)]).toMatchObject([
      {
        a: {
          label: "a",
          value: sym("A"),
        },
        two: {
          label: "two",
          value: num(2),
        },
      },
      {
        a: {
          label: "a",
          value: sym("AA"),
        },
      },
      {
        a: {
          label: "a",
          value: sym("a"),
        },
      },
    ]);
  });
});

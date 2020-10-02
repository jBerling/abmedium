import { num, sym, layer } from "./core";
import { layers } from "./layers";
import { document } from "./document";
import Automerge from "automerge";

describe("layers", () => {
  it("return layers but not nodes", () => {
    let doc = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes.a = { label: "a", value: sym("A") };
      doc.layers.base.nodes.two = { label: "two", value: num(2) };
      doc.layers.c = layer<{}>("c", { a: { label: "a", value: sym("AA") } });
      doc.layers.d = layer<{}>("d", { a: { label: "a", value: sym("a") } });
    });

    expect([...layers(doc)]).toMatchObject([
      {
        label: "base",
        nodes: {
          a: {
            label: "a",
            value: sym("A"),
          },
          two: {
            label: "two",
            value: num(2),
          },
        },
      },
      {
        label: "c",
        nodes: {
          a: {
            label: "a",
            value: sym("AA"),
          },
        },
      },
      {
        label: "d",
        nodes: {
          a: {
            label: "a",
            value: sym("a"),
          },
        },
      },
    ]);
  });
});

import { num, sym, str } from "./core";
import { nodes } from "./nodes";
import { Projection, Sym, Str } from "./types";

describe("nodes", () => {
  // TODO: simultaneities and disagreements
  it("return nodes but not layers", () => {
    const projection: Projection<{ type: Sym; ts: Str }> = {
      nodes: {
        a: {
          label: "a",
          value: sym("A"),
          metadata: { type: sym("string"), ts: str("202007-14T23:34Z") },
        },
        two: {
          label: "two",
          value: num(2),
          metadata: { type: sym("number"), ts: str("202007-14T22:23Z") },
        },
      },
    };

    expect([...nodes(projection)]).toEqual([
      {
        label: "a",
        value: sym("A"),
        metadata: { type: sym("string"), ts: str("202007-14T23:34Z") },
      },
      {
        label: "two",
        value: num(2),
        metadata: { type: sym("number"), ts: str("202007-14T22:23Z") },
      },
    ]);
  });
});

import { num, sym, str } from "./core";
import { nodes } from "./nodes";
import { Projection } from "./types";

describe("nodes", () => {
  // TODO: simultaneities and disagreements
  it("return nodes but not layers", () => {
    const projection: Projection = {
      nodes: { a: sym("A"), two: num(2) },
      metadata: {
        type: {
          a: str("string"),
          two: str("number"),
        },
        ts: {
          a: str("202007-14T23:34Z"),
          two: str("202007-14T22:23Z"),
        },
      },
      simultaneities: {},
      disagreements: {},
    };

    expect([...nodes(projection)]).toEqual([
      {
        label: "a",
        value: sym("A"),
        metadata: { type: str("string"), ts: str("202007-14T23:34Z") },
      },
      {
        label: "two",
        value: num(2),
        metadata: { type: str("number"), ts: str("202007-14T22:23Z") },
      },
    ]);
  });
});

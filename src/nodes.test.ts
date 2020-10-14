import { numn, sym, symn, str } from "./core";
import { nodes } from "./nodes";
import { Projection, Sym, Str } from "./types";

test("nodes", () => {
  const projection: Projection<{ type: Sym; ts: Str }> = {
    nodes: {
      a: symn("a", "A", { type: sym("string"), ts: str("202007-14T23:34Z") }),
      two: numn("two", 2, {
        type: sym("number"),
        ts: str("202007-14T22:23Z"),
      }),
    },
  };

  expect([...nodes(projection)]).toEqual([
    symn("a", "A", { type: sym("string"), ts: str("202007-14T23:34Z") }),
    numn("two", 2, { type: sym("number"), ts: str("202007-14T22:23Z") }),
  ]);
});

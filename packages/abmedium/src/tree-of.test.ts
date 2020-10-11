import { numn, sym, symn, strn, niln, seqn } from "./core";
import { treeOf } from "./tree-of";
import { PresNode, Sym } from "./types";
import { presNodeswitch } from "./nodeswitch";

describe("treeOf", () => {
  it("creates a tree with default presenter", () => {
    type Meta = { type: Sym };
    const call = sym("call");
    const number = sym("number");
    const symbol = sym("symbol");
    expect(
      treeOf<Meta, PresNode<Meta, PresNode<Meta, any>>>({
        nodes: {
          0: seqn(0, [1, 2, 3], { type: call }),
          1: symn(1, "+", { type: symbol }),
          2: seqn(2, [4, 5], { type: call }),
          3: numn(3, 200, { type: number }),
          4: symn(4, "inc", { type: symbol }),
          5: numn(5, 10, { type: number }),
        },
      })
    ).toEqual({
      ...seqn(0, [1, 2, 3], { type: call }),
      items: [
        { ...symn(1, "+", { type: symbol }), parent: 0, pos: 0 },
        {
          ...seqn(2, [4, 5], { type: call }),
          items: [
            { ...symn(4, "inc", { type: symbol }), parent: 2, pos: 0 },
            { ...numn(5, 10, { type: number }), parent: 2, pos: 1 },
          ],
          parent: 0,
          pos: 1,
        },
        { ...numn(3, 200, { type: number }), parent: 0, pos: 2 },
      ],
    });
  });

  it("Handles nil values", () => {
    expect(treeOf({ nodes: { 0: niln(0, {}) } })).toEqual(niln(0, {}));
  });

  it("creates a tree with a custom root node", () => {
    const res = treeOf(
      {
        nodes: {
          3: seqn(3, [4, 5], {}),
          4: strn(4, "a", {}),
          5: strn(5, "b", {}),
        },
      },
      undefined,
      3
    );
    expect(res).toEqual({
      ...seqn(3, [4, 5], {}),
      items: [
        { ...strn(4, "a", {}), parent: 3, pos: 0 },
        { ...strn(5, "b", {}), parent: 3, pos: 1 },
      ],
    });
  });

  it("uses a custom node presenter", () => {
    type Sexpr = string;

    const res = treeOf(
      {
        nodes: {
          0: seqn(0, [1, 2, 3], {}),
          1: symn(1, "+", {}),
          2: numn(2, 100, {}),
          3: numn(3, 200, {}),
        },
      },
      presNodeswitch<{}, Sexpr>({
        seq: (_, items) => `(${items.join(" ")})`,
        scalar: (node) => String(node.value),
      })
    );

    expect(res).toEqual("(+ 100 200)");
  });
});

import { setIn, mSetIn } from "./util";

describe("util", () => {
  test("setIn", () => {
    expect(setIn({ a: { b: "c" }, d: {} }, ["d", "e"], "f")).toEqual({
      a: { b: "c" },
      d: { e: "f" },
    });
  });

  test("mSetIn", () => {
    const o = { a: { b: "c" }, d: {} };

    mSetIn(o, ["d", "e"], "f");

    expect(o).toEqual({
      a: { b: "c" },
      d: { e: "f" },
    });
  });

  //   it("mSetIn", () => {
  //     const res = {};

  //     u.mSetIn(res, ["a", "b", "val"], true);
  //     u.mSetIn(res, ["a", "val"], true);

  //     expect(res).toEqual({ a: { b: { val: true }, val: true } });
  //   });
  //   it("mSetIn with symbols", () => {
  //     const res = {};

  //     const aSym = Symbol("a");
  //     const bSym = Symbol("b");

  //     u.mSetIn(res, [aSym, bSym, "val"], true);
  //     u.mSetIn(res, [aSym, "val"], true);

  //     expect(res).toEqual({ [aSym]: { [bSym]: { val: true }, val: true } });
  //   });
});

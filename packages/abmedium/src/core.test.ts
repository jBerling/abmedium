export {};

import {
  sym,
  sim,
  seq,
  seqItems,
  str,
  nil,
  num,
  disagreement,
  mapping,
  valtype,
  lengthOf,
  editvalOf,
  isEqual,
} from "./core";

describe("core", () => {
  test("valtype", () => {
    expect(valtype(sym("a"))).toEqual("sym");
    expect(valtype(seq())).toEqual("seq");
    expect(valtype(str(""))).toEqual("str");
    expect(valtype(num(0))).toEqual("num");
    expect(valtype(sim("a", "b"))).toEqual("sim");
    expect(valtype(disagreement("a", "b", "c"))).toEqual("dis");
    expect(valtype(nil)).toEqual("nil");
    expect(valtype(mapping(str("b"), str("a")))).toEqual("mapping");
  });

  test("valtype with conditional flag", () => {
    expect(valtype(sym("a"), "sym")).toBe(true);
    expect(valtype(sym("a"), "seq")).toBe(false);
    expect(valtype(seq(), "seq")).toBe(true);
    expect(valtype(str(""), "str")).toBe(true);
    expect(valtype(num(0), "num")).toBe(true);
    expect(valtype(sim("a", "b"), "sim")).toBe(true);
    expect(valtype(disagreement("a", "b", "c"), "dis")).toBe(true);
    expect(valtype(sym("a"), "str", "num", "sym")).toBe(true);
    expect(valtype(nil, "nil")).toBe(true);
    expect(valtype(mapping(str("b"), str("a")), "mapping")).toBe(true);
  });

  test("valtype with switch flag", () => {
    const collected = [];
    const collect = (t) => (v) => collected.push([t, v]);

    valtype(seq(), { seq: collect("seq") });
    valtype(sym("a"), { sym: collect("sym") });
    valtype(str(""), { str: collect("str") });
    valtype(num(0), { num: collect("num") });
    valtype(sim("a", "b"), { sim: collect("sim") });
    valtype(disagreement("a", "b", "c"), { dis: collect("dis") });
    valtype(sym("a"), { _: collect("_") });
    valtype(nil, { nil: collect("nil") });
    valtype(mapping(str("b"), str("a")), { mapping: collect("mapping") });

    expect(collected).toMatchObject([
      ["seq", seq()],
      ["sym", sym("a")],
      ["str", str("")],
      ["num", num(0)],
      ["sim", sim("a", "b")],
      ["dis", disagreement("a", "b", "c")],
      ["_", sym("a")],
      ["nil", nil],
      ["mapping", mapping(str("b"), str("a"))],
    ]);

    expect(valtype(sym("a"), { sym: "foo" })).toEqual("foo");
  });

  test("lengthOf", () => {
    expect(
      [
        seq(1, 2, 3),
        sym("ab"),
        str("abc"),
        num("1001"),
        nil,
        sim("a", "b"),
        disagreement("a", "b", "c"),
        mapping(str("b"), str("a")),
      ].map(lengthOf)
    ).toMatchObject([3, 2, 3, 4, 0, NaN, NaN, NaN]);
  });

  test("editvalOf", () => {
    expect(
      [
        seq(1, 2, 3),
        sym("ab"),
        str("abc"),
        num("1001"),
        nil,
        sim(str("a"), str("b")),
        disagreement(str("a"), str("b"), str("c")),
        mapping(str("b"), str("a")),
      ].map(editvalOf)
    ).toMatchObject([
      [1, 2, 3],
      "ab",
      "abc",
      "1001",
      "",
      ["a", "b"],
      { expected: "a", actual: "b", to: "c" },
      { from: "a", to: "b" },
    ]);
  });

  test("sim of sims", () => {
    expect(sim(sim("a", "b"), "c", sim("d", "e"))).toEqual(
      sim("a", "b", "c", "d", "e")
    );
  });

  test("seq items", () => {
    expect(seqItems(seq(num(1), num(2)))).toEqual([num(1), num(2)]);
  });

  describe("isEqual", () => {
    const testEquality = (a, b, ...cs) => {
      test("" + a + " = " + b, () => {
        expect(isEqual(a, b)).toBe(true);
      });
      for (const c of cs) {
        test("" + a + " ≠ " + c, () => {
          expect(isEqual(a, c)).toBe(false);
        });
      }
    };

    testEquality(num(1), num(1), num(2));
    testEquality(str("a"), str("a"), str("b"), sym("a"));
    testEquality(sym("a"), sym("a"), sym("b"), str("a"));
    testEquality(seq(1, 2, 3), seq(1, 2, 3), seq(3, 2, 1));
    testEquality(nil, nil);
    testEquality(
      sim(str("a"), str("b")),
      sim(str("b"), str("a")),
      sim(str("a"), str("c"))
    );
    testEquality(
      disagreement(str("a"), str("b"), str("c")),
      disagreement(str("a"), str("b"), str("c")),
      disagreement(str("b"), str("c"), str("a"))
    );
    testEquality(
      mapping(str("b"), str("a")),
      mapping(str("b"), str("a")),
      mapping(str("a"), str("b"))
    );
  });
});

export {};

import {
  sym,
  sim,
  seq,
  seqItems,
  str,
  nil,
  num,
  dis,
  valtype,
  valtypeIn,
  lengthOf,
  isEqual,
} from "./core";

describe("core", () => {
  test("valtype", () => {
    expect(valtype(sym("a"))).toEqual("sym");
    expect(valtype(seq())).toEqual("seq");
    expect(valtype(str(""))).toEqual("str");
    expect(valtype(num(0))).toEqual("num");
    expect(valtype(sim("a", "b"))).toEqual("sim");
    expect(valtype(dis("a", "b", "c"))).toEqual("dis");
    expect(valtype(nil)).toEqual("nil");
  });

  test("valtypeIn", () => {
    expect(valtypeIn(sym("a"), "sym")).toBe("sym");
    expect(valtypeIn(sym("a"), "seq")).toBe(undefined);
    expect(valtypeIn(seq(), "seq")).toBe("seq");
    expect(valtypeIn(str(""), "str")).toBe("str");
    expect(valtypeIn(num(0), "num")).toBe("num");
    expect(valtypeIn(sim("a", "b"), "sim")).toBe("sim");
    expect(valtypeIn(dis("a", "b", "c"), "dis")).toBe("dis");
    expect(valtypeIn(sym("a"), "str", "num", "sym")).toBe("sym");
    expect(valtypeIn(nil, "nil")).toBe("nil");
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
        dis("a", "b", "c"),
      ].map(lengthOf)
    ).toMatchObject([3, 2, 3, 4, 0, NaN, NaN]);
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
      dis(str("a"), str("b"), str("c")),
      dis(str("a"), str("b"), str("c")),
      dis(str("b"), str("c"), str("a"))
    );
  });
});

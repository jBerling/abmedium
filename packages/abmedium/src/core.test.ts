import {
  sym,
  sim,
  seq,
  seqItems,
  str,
  nil,
  num,
  dis,
  ref,
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
    expect(valtype(dis({ expected: "a", actual: "b", to: "c" }))).toEqual(
      "dis"
    );
    expect(valtype(nil)).toEqual("nil");
    expect(valtype(ref(0))).toEqual("ref");
  });

  test("valtypeIn", () => {
    expect(valtypeIn(sym("a"), "sym")).toBe("sym");
    expect(valtypeIn(sym("a"), "seq")).toBe(undefined);
    expect(valtypeIn(seq(), "seq")).toBe("seq");
    expect(valtypeIn(str(""), "str")).toBe("str");
    expect(valtypeIn(num(0), "num")).toBe("num");
    expect(valtypeIn(sim("a", "b"), "sim")).toBe("sim");
    expect(valtypeIn(dis({ expected: "a", actual: "b", to: "c" }), "dis")).toBe(
      "dis"
    );
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
        dis({ expected: "a", actual: "b", to: "c" }),
        ref("root"),
      ].map(lengthOf)
    ).toMatchObject([3, 2, 3, 4, 0, NaN, NaN, NaN]);
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
    testEquality(ref(0), ref("0"), ref(1));
    testEquality(seq(1, 2, 3), seq(1, 2, 3), seq(3, 2, 1));
    testEquality(nil, nil);
    testEquality(
      sim(str("a"), str("b")),
      sim(str("b"), str("a")),
      sim(str("a"), str("c"))
    );
    testEquality(
      dis({ expected: str("a"), actual: str("b"), to: str("c") }),
      dis({ expected: str("a"), actual: str("b"), to: str("c") }),
      dis({ expected: str("b"), actual: str("c"), to: str("a") })
    );
  });
});

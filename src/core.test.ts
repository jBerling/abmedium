import {
  nil,
  num,
  ref,
  seq,
  str,
  sym,
  txt,
  valtype,
  valtypeIn,
  lengthOf,
  isEqual,
} from "./core";

import { Text } from "automerge";

describe("core", () => {
  test("valtype", () => {
    expect(valtype(sym("a"))).toEqual("sym");
    expect(valtype(seq())).toEqual("seq");
    expect(valtype(str(""))).toEqual("str");
    expect(valtype(num(0))).toEqual("num");
    expect(valtype(nil)).toEqual("nil");
    expect(valtype(ref(0))).toEqual("ref");
    expect(valtype(txt(new Text("foo")))).toEqual("txt");
  });

  test("valtypeIn", () => {
    expect(valtypeIn(sym("a"), "sym")).toBe("sym");
    expect(valtypeIn(sym("a"), "seq")).toBe(undefined);
    expect(valtypeIn(seq(), "seq")).toBe("seq");
    expect(valtypeIn(str(""), "str")).toBe("str");
    expect(valtypeIn(num(0), "num")).toBe("num");
    expect(valtypeIn(sym("a"), "str", "num", "sym")).toBe("sym");
    expect(valtypeIn(nil, "nil")).toBe("nil");
    expect(valtypeIn(txt(new Text("b")), "txt")).toBe("txt");
  });

  test("lengthOf", () => {
    expect(
      [
        nil,
        num("1001"),
        ref("root"),
        seq([1, 2, 3]),
        str("abc"),
        sym("ab"),
        txt(new Text("tada")),
      ].map(lengthOf)
    ).toMatchObject([0, 4, NaN, 3, 3, 2, 4]);
  });

  describe("isEqual", () => {
    const testEquality = (a, b, ...cs) => {
      const aStr = String(a && `${a.type}(${a.value})`);
      const bStr = String(b && `${b.type}(${b.value})`);
      test("" + aStr + " = " + bStr, () => {
        expect(isEqual(a, b)).toBe(true);
      });
      for (const c of cs) {
        const cStr = String(c && `${c.type}(${c.value})`);
        test("" + aStr + " ≠ " + cStr, () => {
          expect(isEqual(a, c)).toBe(false);
        });
      }
    };

    testEquality(num(1), num(1), num(2));
    testEquality(str("a"), str("a"), str("b"), sym("a"));
    testEquality(sym("a"), sym("a"), sym("b"), str("a"));
    testEquality(ref(0), ref("0"), ref(1));
    testEquality(seq([1, 2, 3]), seq([1, 2, 3]), seq([3, 2, 1]));
    testEquality(nil, nil);
    testEquality(
      txt(new Text("abra")),
      txt(new Text("abra")),
      str("abra"),
      sym("abra")
    );
    testEquality(undefined, undefined, nil);
  });
});

import { seq, sym, str, num, nil, ref } from "./core";
import { valswitch } from "./valswitch";
import { NodeValue } from "./types";

describe("valswitch", () => {
  test("All functions", () => {
    const switcher = valswitch<[string, NodeValue["value"]]>({
      nil: (n) => ["nil", n],
      num: (n) => ["num", n],
      ref: (l) => ["ref", l],
      seq: (s) => ["seq", s],
      str: (s) => ["str", s],
      sym: (s) => ["sym", s],
    });

    const collected = [
      switcher(nil),
      switcher(num(0)),
      switcher(ref(10)),
      switcher(seq()),
      switcher(str("")),
      switcher(sym("a")),
    ];

    expect(collected).toMatchObject([
      ["nil", null],
      ["num", 0],
      ["ref", 10],
      ["seq", []],
      ["str", ""],
      ["sym", "a"],
    ]);
  });

  test("_", () => {
    expect(valswitch({ _: "foo" })(sym("a"))).toEqual("foo");
  });

  test("scalar", () => {
    expect(valswitch({ scalar: "bar" })(sym("a"))).toEqual("bar");
  });
});

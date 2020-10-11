import { seq, sym, str, num, nil, ref } from "./core";
import { valswitch } from "./valswitch";
import { NodeValue } from "./types";

describe("valswitch", () => {
  test("All functions", () => {
    const switcher = valswitch<[string, NodeValue["value"]]>({
      seq: (s) => ["seq", s],
      sym: (s) => ["sym", s],
      str: (s) => ["str", s],
      num: (n) => ["num", n],
      nil: (n) => ["nil", n],
      ref: (l) => ["ref", l],
      _: (v) => ["_", v],
    });

    const collected = [
      switcher(seq()),
      switcher(sym("a")),
      switcher(str("")),
      switcher(num(0)),
      switcher(nil),
      switcher(ref(10)),
    ];

    expect(collected).toMatchObject([
      ["seq", []],
      ["sym", "a"],
      ["str", ""],
      ["num", 0],
      ["nil", null],
      ["ref", 10],
    ]);
  });

  test("_", () => {
    expect(valswitch({ _: "foo" })(sym("a"))).toEqual("foo");
  });
});

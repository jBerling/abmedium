import { seq, sym, str, num, sim, dis, nil } from "./core";
import { valswitch } from "./valswitch";
import { NodeValue } from "./types";

describe("valswitch", () => {
  test("All functions", () => {
    const switcher = valswitch<[string, NodeValue]>({
      seq: (s) => ["seq", s],
      sym: (s) => ["sym", s],
      str: (s) => ["str", s],
      num: (n) => ["num", n],
      sim: (s) => ["sim", s],
      dis: (d) => ["dis", d],
      nil: (n) => ["nil", n],
      _: (v) => ["_", v],
    });

    const collected = [
      switcher(seq()),
      switcher(sym("a")),
      switcher(str("")),
      switcher(num(0)),
      switcher(sim(str("a"), str("b"))),
      switcher(dis("a", "b", "c")),
      switcher(nil),
    ];

    expect(collected).toMatchObject([
      ["seq", seq()],
      ["sym", sym("a")],
      ["str", str("")],
      ["num", num(0)],
      ["sim", sim("a", "b")],
      ["dis", dis("a", "b", "c")],
      ["nil", nil],
    ]);
  });

  test("_", () => {
    expect(valswitch({ _: "foo" })(sym("a"))).toEqual("foo");
  });
});

import { seq, sym, str, num, sim, dis, nil, ref } from "./core";
import { nodeswitch } from "./nodeswitch";
import { Node } from "./types";

describe("valswitch", () => {
  test("All functions", () => {
    const switcher = nodeswitch<{}, [string, Node<{}>]>({
      seq: (s) => ["seq", s],
      sym: (s) => ["sym", s],
      str: (s) => ["str", s],
      num: (n) => ["num", n],
      nil: (n) => ["nil", n],
      ref: (l) => ["ref", l],
      _: (v) => ["_", v],
    });

    const collected = [
      switcher({ label: 0, value: seq() }),
      switcher({ label: 0, value: sym("a") }),
      switcher({ label: 0, value: str("") }),
      switcher({ label: 0, value: num(0) }),
      switcher({ label: 0, value: nil }),
      switcher({ label: 0, value: ref(10) }),
    ];

    expect(collected).toMatchObject([
      ["seq", { label: 0, value: seq() }],
      ["sym", { label: 0, value: sym("a") }],
      ["str", { label: 0, value: str("") }],
      ["num", { label: 0, value: num(0) }],
      ["nil", { label: 0, value: nil }],
      ["ref", { label: 0, value: ref(10) }],
    ]);
  });

  test("_", () => {
    expect(nodeswitch({ _: "foo" })({ label: 0, value: sym("a") })).toEqual(
      "foo"
    );
  });
});

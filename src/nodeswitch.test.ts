import { seqn, symn, strn, numn, niln, refn } from "./core";
import { nodeswitch, projNodeswitch, presNodeswitch } from "./nodeswitch";
import { Node, ProjNode, PresNode } from "./types";

describe("nodeswitch", () => {
  test("nodeswitch", () => {
    const switcher = nodeswitch<{}, [string, Node<{}>]>({
      nil: (n) => ["nil", n],
      num: (n) => ["num", n],
      ref: (n) => ["ref", n],
      seq: (n) => ["seq", n],
      str: (n) => ["str", n],
      sym: (n) => ["sym", n],
    });

    const collected = [
      switcher(niln(0, {})),
      switcher(numn(0, 0, {})),
      switcher(refn(0, 10, {})),
      switcher(seqn(0, [], {}), []),
      switcher(strn(0, "", {})),
      switcher(symn(0, "a", {})),
    ];

    expect(collected).toMatchObject([
      ["nil", niln(0, {})],
      ["num", numn(0, 0, {})],
      ["ref", refn(0, 10, {})],
      ["seq", seqn(0, [], {})],
      ["str", strn(0, "", {})],
      ["sym", symn(0, "a", {})],
    ]);
  });

  test("scalar", () => {
    type StringList = string | StringList[];
    const switcher = nodeswitch<{}, StringList>({
      seq: (_, items) => items,
      scalar: (item) => String(item.value),
    });

    expect(switcher(seqn(0, [1, 2], {}), ["foo", "bar"])).toEqual([
      "foo",
      "bar",
    ]);

    expect(switcher(symn(1, "foo", {}))).toEqual("foo");
  });

  test("projNodeSwitch", () => {
    const switcher = projNodeswitch<{}, [string, ProjNode<{}>]>({
      num: (n, sims) => {
        if (sims && sims.bb) return switcher(sims.bb);
        return ["num", n];
      },
      _: (n) => ["_", n],
    });

    const collected = [
      switcher(niln(0, {})),
      switcher(numn(0, 10, {})),
      switcher(numn(0, 11, {}), undefined, {
        aa: numn(0, 11, {}),
        bb: symn(0, "unset", {}),
      }),
    ];

    expect(collected).toMatchObject([
      ["_", niln(0, {})],
      ["num", numn(0, 10, {})],
      ["_", symn(0, "unset", {})],
    ]);
  });

  test("presNodeSwitch", () => {
    const switcher = presNodeswitch<{}, [string, PresNode<{}, string>]>({
      num: (n, sims) => {
        if (sims && sims.bb) return switcher(sims.bb);
        return ["num", n];
      },
      _: (n, sims) => {
        if (sims && sims.bb) return switcher(sims.bb);
        return ["_", n];
      },
    });

    const collected = [
      switcher(niln(0, {})),
      switcher(numn(0, 10, {})),
      switcher(numn(0, 11, {}), undefined, {
        aa: numn(0, 11, {}),
        bb: symn(0, "unset", {}),
      }),
    ];

    expect(collected).toMatchObject([
      ["_", niln(0, {})],
      ["num", numn(0, 10, {})],
      ["_", symn(0, "unset", {})],
    ]);
  });
});

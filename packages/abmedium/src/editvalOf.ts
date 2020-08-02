import { valswitch } from "./valswitch";
import { Str, Num } from "./types";

export const editvalOf = (value) =>
  valswitch<any>({
    seq: ([, items]) => items,
    sym: ([, name]) => name,
    str: (s: Str) => s,
    num: (n: Num) => String(n),
    nil: "",
    sim: ([, items]) => items.map(editvalOf),
    dis: ([, { expected, actual, to }]) => ({
      expected: editvalOf(expected),
      actual: editvalOf(actual),
      to: editvalOf(to),
    }),
  })(value);

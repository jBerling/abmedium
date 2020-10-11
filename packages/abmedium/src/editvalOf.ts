import { valswitch } from "./valswitch";
import { Label, NodeValue } from "./types";

export const editvalOf = (value: NodeValue) =>
  valswitch<string | Label[]>({
    nil: "",
    seq: (items) => items,
    _: (v) => String(v),
  })(value);

import { NodeValue, Str, Num, Sym, Seq, Nil, Ref } from "./types";

import { valtype } from "./core";

type Switch<R> = {
  seq?: ((value: Seq["value"], items: R[]) => R) | R;
  sym?: ((value: Sym["value"]) => R) | R;
  str?: ((value: Str["value"]) => R) | R;
  num?: ((value: Num["value"]) => R) | R;
  nil?: ((value: Nil["value"]) => R) | R;
  ref?: ((value: Ref["value"]) => R) | R;
  _?: ((v: NodeValue["value"]) => R) | R;
};

export const valswitch = <R>(sw: Switch<R>) => (
  v: NodeValue,
  items?: R[]
): R => {
  const vt = valtype(v);
  if (!vt) {
    // TODO handle
    throw new Error(`Not a NodeValue type >${JSON.stringify(v)}<`);
  }
  const handler = sw[vt] !== undefined ? sw[vt] : sw._;
  if (handler === undefined) {
    throw new Error("no _ or " + vt + " handler");
  }
  if (typeof handler === "function") {
    return (handler as any)(v.value, items);
  }
  return handler;
};

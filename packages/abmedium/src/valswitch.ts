import { NodeValue, Str, Num, Sim, Dis, Sym, Seq, Nil } from "./types";

import { valtype } from "./core";

type Switch<R> = {
  seq?: ((seq: Seq, items: R[]) => R) | R;
  sym?: ((sym: Sym) => R) | R;
  str?: ((str: Str) => R) | R;
  num?: ((num: Num) => R) | R;
  sim?: ((sim: Sim, items: R[]) => R) | R;
  dis?: ((dis: Dis) => R) | R;
  nil?: ((nil: Nil) => R) | R;
  _?: ((v: NodeValue) => R) | R;
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
    return (handler as any)(v, items);
  }
  return handler;
};

import { NodeValue, Str, Num, Sym, Seq, Nil, Ref, Scalar } from "./types";

import { Txt } from "./txt";

import { valtype, valtypeIn } from "./core";

import { scalarTypeNames } from "./constants";

type Switch<R> = {
  nil?: ((value: Nil["value"]) => R) | R;
  num?: ((value: Num["value"]) => R) | R;
  ref?: ((value: Ref["value"]) => R) | R;
  seq?: ((value: Seq["value"], items: R[]) => R) | R;
  str?: ((value: Str["value"]) => R) | R;
  sym?: ((value: Sym["value"]) => R) | R;
  txt?: ((value: Txt["value"]) => R) | R;
  scalar?: ((value: Scalar["value"]) => R) | R;
  _?: ((v: NodeValue["value"]) => R) | R;
};

export const valswitch = <R>(sw: Switch<R>) => (
  v: NodeValue,
  items?: R[]
): R => {
  const vt = valtype(v);

  let handler: any = sw[vt];
  if (handler === undefined && valtypeIn(v, ...scalarTypeNames)) {
    handler = sw.scalar;
  }
  if (handler === undefined) handler = sw._;

  if (handler === undefined) {
    throw new Error("no _ or " + vt + " handler");
  }

  if (typeof handler === "function") {
    return (handler as any)(v.value, items);
  }

  return handler;
};

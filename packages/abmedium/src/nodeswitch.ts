import {
  NodeValue,
  Node,
  Str,
  Num,
  Sim,
  Dis,
  Sym,
  Seq,
  Nil,
  Ref,
  Metadata,
} from "./types";

import { valtype } from "./core";

type Switch<M extends Metadata, R> = {
  seq?: ((node: Node<M, Seq>, items: R[]) => R) | R;
  sym?: ((sym: Node<M, Sym>) => R) | R;
  str?: ((str: Node<M, Str>) => R) | R;
  num?: ((num: Node<M, Num>) => R) | R;
  nil?: ((nil: Node<M, Nil>) => R) | R;
  ref?: ((ref: Node<M, Ref>) => R) | R;
  _?: ((v: Node<M>) => R) | R;
};

export const nodeswitch = <M extends Metadata, R>(sw: Switch<M, R>) => (
  v: Node<M>,
  items?: R[]
): R => {
  const vt = valtype(v.value);
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

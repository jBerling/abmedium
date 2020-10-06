import { Node, NodeValue, Metadata } from "./types";

import { valtype } from "./core";

type Switch<
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue,
  N extends Node<M, T> = Node<M, T>
> = {
  seq?: ((node: N, items: R[]) => R) | R;
  sym?: ((sym: N) => R) | R;
  str?: ((str: N) => R) | R;
  num?: ((num: N) => R) | R;
  nil?: ((nil: N) => R) | R;
  ref?: ((ref: N) => R) | R;
  _?: ((v: N) => R) | R;
};

export const nodeswitch = <
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue,
  N extends Node<M, T> = Node<M, T>
>(
  sw: Switch<M, R, T, N>
) => (v: N, items?: R[]): R => {
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

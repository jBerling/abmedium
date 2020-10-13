import {
  Nil,
  Num,
  Ref,
  Seq,
  Str,
  Sym,
  Node,
  ProjNode,
  PresNode,
  NodeValue,
  Metadata,
  ActorId,
  NodePresenter,
  Scalar,
} from "./types";

import { Txt } from "./txt";

import { valtype, valtypeIn } from "./core";

import { scalarTypeNames } from "./constants";

// TODO lot's of repetition in this file

type NodeSwitch<M extends Metadata, R> = {
  nil?: ((nil: Node<M, Nil>) => R) | R;
  num?: ((num: Node<M, Num>) => R) | R;
  ref?: ((ref: Node<M, Ref>) => R) | R;
  seq?: ((node: Node<M, Seq>, items: R[]) => R) | R;
  str?: ((str: Node<M, Str>) => R) | R;
  sym?: ((sym: Node<M, Sym>) => R) | R;
  txt?: ((txt: Node<M, Txt>) => R) | R;
  scalar?: ((scalar: Node<M, Scalar>) => R) | R;
  _?: ((v: Node<M>) => R) | R;
};

export const nodeswitch = <
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
>(
  sw: NodeSwitch<M, R>
) => (n: Node<M, T>, items?: R[]): R => {
  const nt = valtype(n);

  let handler: any = sw[nt];
  if (handler === undefined && valtypeIn(n, ...scalarTypeNames)) {
    handler = sw.scalar;
  }
  if (handler === undefined) handler = sw._;

  if (handler === undefined) {
    throw new Error("no _ or " + nt + " handler");
  }

  if (typeof handler === "function") {
    return (handler as any)(n, items);
  }

  return handler;
};

type ProjNodeSwitch<M extends Metadata, R> = {
  nil?:
    | ((
        node: ProjNode<M, Nil>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  num?:
    | ((
        node: ProjNode<M, Num>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  ref?:
    | ((
        node: ProjNode<M, Ref>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  seq?:
    | ((
        node: ProjNode<M, Seq>,
        items: R[],
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  str?:
    | ((
        node: ProjNode<M, Str>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  sym?:
    | ((
        node: ProjNode<M, Sym>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  txt?:
    | ((
        node: ProjNode<M, Txt>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  scalar?:
    | ((
        scalar: ProjNode<M, Scalar>,
        simultaneities?: Record<ActorId, ProjNode<M>>
      ) => R)
    | R;
  _?:
    | ((node: ProjNode<M>, simultaneities: Record<ActorId, ProjNode<M>>) => R)
    | R;
};

export const projNodeswitch = <
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
>(
  sw: ProjNodeSwitch<M, R>
) => (
  n: ProjNode<M, T>,
  items?: R[],
  simultaneities?: Record<ActorId, ProjNode<M, T>>
): R => {
  const nt = valtype(n);

  let handler: any = sw[nt];
  if (handler === undefined && valtypeIn(n, ...scalarTypeNames)) {
    handler = sw.scalar;
  }
  if (handler === undefined) handler = sw._;

  if (handler === undefined) {
    throw new Error("no _ or " + nt + " handler");
  }

  if (typeof handler === "function") {
    if (nt === "seq") return (handler as any)(n, items, simultaneities);
    return (handler as any)(n, simultaneities);
  }

  return handler;
};

type PresNodeSwitch<M extends Metadata, R> = {
  nil?:
    | ((
        node: PresNode<M, R, Nil>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  num?:
    | ((
        node: PresNode<M, R, Num>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  ref?:
    | ((
        node: PresNode<M, R, Ref>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  seq?:
    | ((
        node: PresNode<M, R, Seq>,
        items: R[],
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  str?:
    | ((
        node: PresNode<M, R, Str>,
        simultaneities: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  sym?:
    | ((
        node: PresNode<M, R, Sym>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  txt?:
    | ((
        node: PresNode<M, R, Txt>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
  scalar?: (
    scalar: PresNode<M, R, Scalar>,
    simultaneities?: Record<ActorId, PresNode<M, R>>
  ) => R | R;
  _?:
    | ((
        node: PresNode<M, R>,
        simultaneities?: Record<ActorId, PresNode<M, R>>
      ) => R)
    | R;
};

export const presNodeswitch = <
  M extends Metadata,
  R,
  T extends NodeValue = NodeValue
>(
  sw: PresNodeSwitch<M, R>
): NodePresenter<M, R, T> => (n, items, simultaneities) => {
  const nt = valtype(n);

  let handler: any = sw[nt];
  if (handler === undefined && valtypeIn(n, ...scalarTypeNames)) {
    handler = sw.scalar;
  }
  if (handler === undefined) handler = sw._;

  if (handler === undefined) {
    throw new Error("no _ or " + nt + " handler");
  }

  if (typeof handler === "function") {
    if (nt === "seq") return (handler as any)(n, items, simultaneities);
    return (handler as any)(n, simultaneities);
  }

  return handler;
};

import Automerge from "automerge";
import { Document, Metadata } from "./types";
import { layer } from "./core";

export const document = <M extends Metadata>() =>
  Automerge.from({
    layers: { base: layer<M>() },
    compositions: {
      default: { label: "base" },
    },
  } as Document<M>);

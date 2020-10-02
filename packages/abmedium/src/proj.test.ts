import { seq, sym, num, str, dis, layer } from "./core";
import { proj } from "./proj";
import Automerge from "automerge";
import { document } from "./document";
import { Num, Str } from "./types";

const testDoc = () =>
  Automerge.change(document<{}>(), (doc) => {
    const base = doc.layers.base;
    base.nodes[1] = { label: 1, value: sym("+") };
    base.nodes[2] = { label: 2, value: num(1) };
    base.nodes[3] = { label: 3, value: num(2) };
    base.nodes[0] = {
      label: 0,
      value: seq(1, 2, 3),
    };

    doc.layers.layer1 = layer<{}>("layer1");
    doc.layers.layer1.nodes[2] = { label: 2, value: num(11), tracked: num(1) };
    doc.layers.layer1.nodes[3] = { label: 3, value: num(21), tracked: num(2) };

    doc.layers.layer1_1 = layer<{}>("layer1_1");
    doc.layers.layer1_1.nodes[3] = {
      label: 3,
      value: num(211),
      tracked: num(21),
    };

    doc.layers.layer2 = layer<{}>("layer2");
    doc.layers.layer2.nodes[2] = { label: 2, value: num(12) };
  });

// TODO write a test that handles metadata conflicts

// TODO from matchObject to equal again

describe("proj", () => {
  it("only base layer", () => {
    expect(proj(testDoc())).toMatchObject({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(1) },
        3: { label: 3, value: num(2) },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("layer with sublayers", () => {
    const projection = proj(testDoc(), {
      label: "base",
      layers: [
        {
          label: "layer1",
          layers: [{ label: "layer1_1" }],
        },
      ],
    });

    expect(projection).toMatchObject({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(11) },
        3: { label: 3, value: num(211) },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("works with layers only existing in composition", () => {
    const projection = proj(testDoc(), {
      label: "base",
      layers: [
        {
          label: "layer1",
          layers: [
            { label: "layer_y" },
            { label: "layer1_1" },
            { label: "layer_z" },
          ],
        },
        { label: "layer_x" },
      ],
    });

    expect(projection).toMatchObject({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(11) },
        3: { label: 3, value: num(211) },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("root replacement", () => {
    const d = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: str("a") };
      doc.layers.replacement = layer<{}>("replacement");
      doc.layers.replacement.nodes[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };
    });

    expect(
      proj(d, { label: "base", layers: [{ label: "replacement" }] })
    ).toMatchObject({
      nodes: {
        0: { label: 0, value: str("b") },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("metadata", () => {
    const d = Automerge.change(document<{ descr?: Str; ts?: Num }>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: seq(1, 2) };

      doc.layers.base.nodes[1] = {
        label: 1,
        value: str("a"),
        metadata: { descr: str("small a"), ts: num(1588321340608) },
      };

      doc.layers.base.nodes[2] = {
        label: 2,
        value: str("b"),
        metadata: {
          descr: str("small b"),

          // Note that this should not be added to the projection.
          // For now that is how is designed, but we are not sure it's the
          // right way to handle it.
          ts: num(1588321366606),
        },
      };

      doc.layers.alt = layer("alt");

      doc.layers.alt.nodes[2] = {
        label: 2,
        value: str("B"),
        metadata: {
          descr: str("big b"),
        },
        tracked: str("b"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "alt" }],
      };
    });

    const result = proj(d);

    expect(result).toMatchObject({
      nodes: {
        0: { label: 0, value: seq(1, 2) },
        1: {
          label: 1,
          value: str("a"),
          metadata: { descr: str("small a"), ts: num(1588321340608) },
        },
        2: {
          label: 2,
          value: str("B"),
          metadata: { descr: str("big b") },
        },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("simple agreement", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: str("b"), tracked: str("a") } },
      simultaneities: {},
      disagreements: {},
    });
  });

  // TODO will not support this for now. Not sure it is right anyway.
  xit("agreement of two equal mappings", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>("layer1");
      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };

      doc.layers.layer2 = layer<{}>("layer2");
      doc.layers.layer2.nodes[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }, { label: "layer2" }],
      };
    });

    const res = proj(x);
    expect(res).toEqual({
      nodes: { 0: { label: 0, value: str("b"), tracked: str("a") } },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("simple disagreement", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: str("c"), tracked: str("b") } },
      simultaneities: {},
      disagreements: {
        0: dis(str("b"), str("a"), str("c")),
      },
    });
  });

  it("disagreement, expected undefined was set", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = { label: 0, value: str("c") };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: str("c") } },
      simultaneities: {},
      disagreements: {
        0: dis(undefined, str("a"), str("c")),
      },
    });
  });

  it("agreement, expected undefined", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = { label: 0, value: str("a") };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: str("a") } },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("disagreement, expected value was undefined", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: str("c"), tracked: str("b") } },
      simultaneities: {},
      disagreements: { 0: dis(str("b"), undefined, str("c")) },
    });
  });

  it("sequence agreement", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: seq(1, 2, 3) };

      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 2, 3),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: seq(3, 2, 1), tracked: seq(1, 2, 3) } },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("sequence disagreement", () => {
    const x = Automerge.change(document<{}>(), (doc) => {
      doc.layers.base.nodes[0] = { label: 0, value: seq(1, 2, 3) };

      doc.layers.layer1 = layer<{}>("layer1");

      doc.layers.layer1.nodes[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 3, 2),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toMatchObject({
      nodes: { 0: { label: 0, value: seq(3, 2, 1), tracked: seq(1, 3, 2) } },
      simultaneities: {},
      disagreements: { 0: dis(seq(1, 3, 2), seq(1, 2, 3), seq(3, 2, 1)) },
    });
  });
});

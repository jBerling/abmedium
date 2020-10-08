import { seq, sym, num, str, dis, sim, layer } from "./core";
import { proj } from "./proj";
import Automerge from "automerge";
import { document } from "./document";
import { Num, Str, Document } from "./types";

const testDoc = () =>
  Automerge.change(Automerge.from(document<{}>()), (doc) => {
    const base = doc.layers.base;
    base[1] = { label: 1, value: sym("+") };
    base[2] = { label: 2, value: num(1) };
    base[3] = { label: 3, value: num(2) };
    base[0] = {
      label: 0,
      value: seq(1, 2, 3),
    };

    doc.layers.layer1 = layer<{}>();
    doc.layers.layer1[2] = { label: 2, value: num(11), tracked: num(1) };
    doc.layers.layer1[3] = { label: 3, value: num(21), tracked: num(2) };

    doc.layers.layer1_1 = layer<{}>();
    doc.layers.layer1_1[3] = {
      label: 3,
      value: num(211),
      tracked: num(21),
    };

    doc.layers.layer2 = layer<{}>();
    doc.layers.layer2[2] = { label: 2, value: num(12) };
  });

// TODO write a test that handles metadata conflicts

describe("proj", () => {
  it("only base layer", () => {
    expect(proj(testDoc())).toEqual({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(1) },
        3: { label: 3, value: num(2) },
      },
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

    expect(projection).toEqual({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(11), tracked: num(1) },
        3: { label: 3, value: num(211), tracked: num(21) },
      },
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

    expect(projection).toEqual({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3) },
        1: { label: 1, value: sym("+") },
        2: { label: 2, value: num(11), tracked: num(1) },
        3: { label: 3, value: num(211), tracked: num(21) },
      },
    });
  });

  it("root replacement", () => {
    const d = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a") };
      doc.layers.replacement = layer<{}>();
      doc.layers.replacement[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };
    });

    expect(
      proj(d, { label: "base", layers: [{ label: "replacement" }] })
    ).toEqual({
      nodes: {
        0: { label: 0, value: str("b"), tracked: str("a") },
      },
    });
  });

  it("metadata", () => {
    const d = Automerge.change(
      Automerge.from(document<{ descr?: Str; ts?: Num }>()),
      (doc) => {
        doc.layers.base[0] = { label: 0, value: seq(1, 2) };

        doc.layers.base[1] = {
          label: 1,
          value: str("a"),
          metadata: { descr: str("small a"), ts: num(1588321340608) },
        };

        doc.layers.base[2] = {
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

        doc.layers.alt = layer();

        doc.layers.alt[2] = {
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
      }
    );

    const result = proj(d);

    expect(result).toEqual({
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
          tracked: str("b"),
          metadata: { descr: str("big b") },
        },
      },
    });
  });

  it("simple agreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: { 0: { label: 0, value: str("b"), tracked: str("a") } },
    });
  });

  // TODO will not support this for now. Not sure it is right anyway.
  xit("agreement of two equal mappings", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>();
      doc.layers.layer1[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
      };

      doc.layers.layer2 = layer<{}>();
      doc.layers.layer2[0] = {
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
    });
  });

  it("simple disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          label: 0,
          value: str("c"),
          tracked: str("b"),
          disagreement: dis({
            expected: str("b"),
            actual: str("a"),
            to: str("c"),
          }),
        },
      },
    });
  });

  it("disagreement, expected undefined was set", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a") };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = { label: 0, value: str("c") };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          label: 0,
          value: str("c"),
          disagreement: dis({
            expected: undefined,
            actual: str("a"),
            to: str("c"),
          }),
        },
      },
    });
  });

  it("agreement, expected undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = { label: 0, value: str("a") };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: { 0: { label: 0, value: str("a") } },
    });
  });

  it("disagreement, expected value was undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          label: 0,
          value: str("c"),
          tracked: str("b"),
          disagreement: dis({
            expected: str("b"),
            actual: undefined,
            to: str("c"),
          }),
        },
      },
    });
  });

  it("sequence agreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: seq(1, 2, 3) };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 2, 3),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: { 0: { label: 0, value: seq(3, 2, 1), tracked: seq(1, 2, 3) } },
    });
  });

  it("sequence disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: seq(1, 2, 3) };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 3, 2),
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          label: 0,
          value: seq(3, 2, 1),
          tracked: seq(1, 3, 2),
          disagreement: dis({
            expected: seq(1, 3, 2),
            actual: seq(1, 2, 3),
            to: seq(3, 2, 1),
          }),
        },
      },
    });
  });

  it("simultaneity", () => {
    // By adding the actor ID statically, the chosen value will be consistent
    let x = Automerge.from(document<{}>(), { actorId: "x" });
    let y = Automerge.merge(Automerge.init<Document<{}>>("y"), x);
    let z = Automerge.merge(Automerge.init<Document<{}>>("z"), x);
    x = Automerge.change(x, (doc) => {
      doc.layers.base.a = { label: "a", value: str("X") };
    });
    y = Automerge.change(y, (doc) => {
      doc.layers.base.a = { label: "a", value: str("Y") };
    });
    z = Automerge.change(z, (doc) => {
      doc.layers.base.a = { label: "a", value: str("Z") };
    });

    x = Automerge.merge(x, y);
    x = Automerge.merge(x, z);

    expect(proj(x)).toEqual({
      nodes: {
        a: {
          label: "a",
          value: str("Z"),
          simultaneities: sim(str("Z"), str("Y"), str("X")),
        },
      },
    });
  });
});

import { seq, sym, num, str, dis, sim, layer } from "./core";
import { proj } from "./proj";
import Automerge from "automerge";
import { document } from "./document";
import { Num, Str, Document } from "./types";

const testDoc = () =>
  Automerge.change(Automerge.from(document<{}>()), (doc) => {
    const base = doc.layers.base;
    base[1] = { label: 1, value: sym("+"), metadata: {} };
    base[2] = { label: 2, value: num(1), metadata: {} };
    base[3] = { label: 3, value: num(2), metadata: {} };
    base[0] = {
      label: 0,
      value: seq(1, 2, 3),
      metadata: {},
    };

    doc.layers.layer1 = layer<{}>();
    doc.layers.layer1[2] = {
      label: 2,
      value: num(11),
      tracked: num(1),
      metadata: {},
    };
    doc.layers.layer1[3] = {
      label: 3,
      value: num(21),
      tracked: num(2),
      metadata: {},
    };

    doc.layers.layer1_1 = layer<{}>();
    doc.layers.layer1_1[3] = {
      label: 3,
      value: num(211),
      tracked: num(21),
      metadata: {},
    };

    doc.layers.layer2 = layer<{}>();
    doc.layers.layer2[2] = { label: 2, value: num(12), metadata: {} };
  });

// TODO write a test that handles metadata conflicts

describe("proj", () => {
  it("only base layer", () => {
    expect(proj(testDoc())).toEqual({
      nodes: {
        0: { label: 0, value: seq(1, 2, 3), metadata: {} },
        1: { label: 1, value: sym("+"), metadata: {} },
        2: { label: 2, value: num(1), metadata: {} },
        3: { label: 3, value: num(2), metadata: {} },
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
        0: { label: 0, value: seq(1, 2, 3), metadata: {} },
        1: { label: 1, value: sym("+"), metadata: {} },
        2: { label: 2, value: num(11), tracked: num(1), metadata: {} },
        3: { label: 3, value: num(211), tracked: num(21), metadata: {} },
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
        0: { label: 0, value: seq(1, 2, 3), metadata: {} },
        1: { label: 1, value: sym("+"), metadata: {} },
        2: { label: 2, value: num(11), tracked: num(1), metadata: {} },
        3: { label: 3, value: num(211), tracked: num(21), metadata: {} },
      },
    });
  });

  it("root replacement", () => {
    const d = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };
      doc.layers.replacement = layer<{}>();
      doc.layers.replacement[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
        metadata: {},
      };
    });

    expect(
      proj(d, { label: "base", layers: [{ label: "replacement" }] })
    ).toEqual({
      nodes: {
        0: { label: 0, value: str("b"), tracked: str("a"), metadata: {} },
      },
    });
  });

  it("metadata", () => {
    const d = Automerge.change(
      Automerge.from(document<{ descr?: Str; ts?: Num }>()),
      (doc) => {
        doc.layers.base[0] = { label: 0, value: seq(1, 2), metadata: {} };

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
        0: { label: 0, value: seq(1, 2), metadata: {} },
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
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
        metadata: {},
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: { label: 0, value: str("b"), tracked: str("a"), metadata: {} },
      },
    });
  });

  // TODO will not support this for now. Not sure it is right anyway.
  xit("agreement of two equal mappings", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };

      doc.layers.layer1 = layer<{}>();
      doc.layers.layer1[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
        metadata: {},
      };

      doc.layers.layer2 = layer<{}>();
      doc.layers.layer2[0] = {
        label: 0,
        value: str("b"),
        tracked: str("a"),
        metadata: {},
      };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }, { label: "layer2" }],
      };
    });

    const res = proj(x);
    expect(res).toEqual({
      nodes: {
        0: { label: 0, value: str("b"), tracked: str("a"), metadata: {} },
      },
    });
  });

  it("simple disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
        metadata: {},
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
          metadata: {},
        },
      },
    });
  });

  it("disagreement, expected undefined was set", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = { label: 0, value: str("c"), metadata: {} };

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
          metadata: {},
        },
      },
    });
  });

  it("agreement, expected undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = { label: 0, value: str("a"), metadata: {} };

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: { 0: { label: 0, value: str("a"), metadata: {} } },
    });
  });

  it("disagreement, expected value was undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: str("c"),
        tracked: str("b"),
        metadata: {},
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
          metadata: {},
        },
      },
    });
  });

  it("sequence agreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: seq(1, 2, 3), metadata: {} };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 2, 3),
        metadata: {},
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
          tracked: seq(1, 2, 3),
          metadata: {},
        },
      },
    });
  });

  it("sequence disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = { label: 0, value: seq(1, 2, 3), metadata: {} };

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = {
        label: 0,
        value: seq(3, 2, 1),
        tracked: seq(1, 3, 2),
        metadata: {},
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
          metadata: {},
          disagreement: dis({
            expected: seq(1, 3, 2),
            actual: seq(1, 2, 3),
            to: seq(3, 2, 1),
          }),
        },
      },
    });
  });

  it("simultaneities on layer (conflicting node creation)", () => {
    // It is probably a good idea to avoid these conflicts and find out a scheme
    // where different actors can't create nodes with the same label.

    // By adding the actor ID statically, the chosen value will be consistent
    let a = Automerge.from(document<{}>(), { actorId: "aa" });
    let b = Automerge.merge(Automerge.init<Document<{}>>("bb"), a);
    let c = Automerge.merge(Automerge.init<Document<{}>>("cc"), a);
    a = Automerge.change(a, (doc) => {
      doc.layers.base[0] = { label: 0, value: str("a"), metadata: {} };
    });
    b = Automerge.change(b, (doc) => {
      doc.layers.base[0] = { label: 0, value: str("b"), metadata: {} };
    });
    c = Automerge.change(c, (doc) => {
      doc.layers.base[0] = { label: 0, value: str("c"), metadata: {} };
    });

    a = Automerge.merge(a, b);
    a = Automerge.merge(a, c);

    expect(proj(a)).toEqual({
      nodes: {
        0: {
          label: 0,
          metadata: {},
          value: str("c"),
        },
      },
      simultaneities: {
        aa: { 0: { label: 0, metadata: {}, value: str("a") } },
        bb: { 0: { label: 0, metadata: {}, value: str("b") } },
        cc: { 0: { label: 0, metadata: {}, value: str("c") } },
      },
    });
  });

  it("simultaneities on node", () => {
    // By adding the actor ID statically, the chosen value will be consistent
    let a = Automerge.from(document<{ author: Str; date: Str }>(), {
      actorId: "aa",
    });

    a = Automerge.change(a, (doc) => {
      doc.layers.base[0] = {
        label: 0,
        value: str("a"),
        metadata: { author: str("Mrs A"), date: str("2020-10-08") },
      };
    });

    let b = Automerge.merge(Automerge.init<Document<{ author: Str }>>("bb"), a);

    let c = Automerge.merge(Automerge.init<Document<{ author: Str }>>("cc"), a);

    a = Automerge.change(a, (doc) => {
      doc.layers.base[0].value = str("A");
      doc.layers.base[0].tracked = str("_");
    });

    b = Automerge.change(b, (doc) => {
      doc.layers.base[0].value = str("B");
      doc.layers.base[0].tracked = str("…");
      doc.layers.base[0].metadata.author = str("Mr B");
    });

    c = Automerge.change(c, (doc) => {
      doc.layers.base[0].value = str("C");
      doc.layers.base[0].metadata.author = str("Dr C");
      doc.layers.base[0].tracked = str("x");
    });

    a = Automerge.merge(a, b);
    a = Automerge.merge(a, c);

    expect(proj(a)).toEqual({
      nodes: {
        0: {
          label: 0,
          metadata: { author: str("Mr B"), date: str("2020-10-08") },
          value: str("C"),
          tracked: str("x"),
          simultaneities: {
            aa: {
              value: str("A"),
              tracked: str("_"),
            },
            bb: {
              value: str("B"),
              tracked: str("…"),
              metadata: { author: str("Mr B") },
            },
            cc: {
              value: str("C"),
              tracked: str("x"),
              metadata: { author: str("Dr C") },
            },
          },
        },
      },
    });
  });
});

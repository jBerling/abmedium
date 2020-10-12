import { seq, seqn, symn, num, numn, str, strn, layer } from "./core";
import { proj } from "./proj";
import Automerge from "automerge";
import { document } from "./document";
import { Num, Str, Document } from "./types";

const testDoc = () =>
  Automerge.change(Automerge.from(document<{}>()), (doc) => {
    const base = doc.layers.base;
    base[1] = symn(1, "+", {});
    base[2] = numn(2, 1, {});
    base[3] = numn(3, 2, {});
    base[0] = seqn(0, [1, 2, 3], {});

    doc.layers.layer1 = layer<{}>();
    doc.layers.layer1[2] = numn(2, 11, {}, num(1));
    doc.layers.layer1[3] = numn(3, 21, {}, num(2));

    doc.layers.layer1_1 = layer<{}>();
    doc.layers.layer1_1[3] = numn(3, 211, {}, num(21));

    doc.layers.layer2 = layer<{}>();
    doc.layers.layer2[2] = numn(2, 12, {});
  });

// TODO write a test that handles metadata conflicts

describe("proj", () => {
  it("only base layer", () => {
    expect(proj(testDoc())).toEqual({
      nodes: {
        0: seqn(0, [1, 2, 3], {}),
        1: symn(1, "+", {}),
        2: numn(2, 1, {}),
        3: numn(3, 2, {}),
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
        0: seqn(0, [1, 2, 3], {}),
        1: symn(1, "+", {}),
        2: numn(2, 11, {}, num(1)),
        3: numn(3, 211, {}, num(21)),
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
        0: seqn(0, [1, 2, 3], {}),
        1: symn(1, "+", {}),
        2: numn(2, 11, {}, num(1)),
        3: numn(3, 211, {}, num(21)),
      },
    });
  });

  it("root replacement", () => {
    const d = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {});
      doc.layers.replacement = layer<{}>();
      doc.layers.replacement[0] = strn(0, "b", {}, str("a"));
    });

    expect(
      proj(d, { label: "base", layers: [{ label: "replacement" }] })
    ).toEqual({
      nodes: {
        0: strn(0, "b", {}, str("a")),
      },
    });
  });

  it("simple agreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "b", {}, str("a"));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: strn(0, "b", {}, str("a")),
      },
    });
  });

  it("simple disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "c", {}, str("b"));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(0, "c", {}, str("b")),
          disagreements: {
            layer1: {
              expected: str("b"),
              actual: str("a"),
              to: str("c"),
            },
          },
        },
      },
    });
  });

  // TODO verify this is a good strategy.
  // Do not implement for now. Might be a bad idea
  xit("agreement, nodes have equal values", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "b", {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "a", {}, str("b"));
      doc.layers.layer1[1] = strn(1, "d", {});
      doc.layers.layer1[2] = strn(2, "f", {}, str("e"));

      doc.layers.layer2 = layer<{}>();

      doc.layers.layer2[0] = strn(0, "a", {}, str("b"));
      doc.layers.layer2[1] = strn(1, "d", {}, str("c"));
      doc.layers.layer2[2] = strn(2, "f", {});

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }, { label: "layer2" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: strn(0, "a", {}, str("b")),
        1: strn(1, "d", {}, str("c")),
        2: strn(2, "f", {}),
      },
    });
  });

  it("disagreement on disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "c", {}, str("b"));

      doc.layers.layer2 = layer<{}>();

      doc.layers.layer2[0] = strn(0, "e", {}, str("d"));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }, { label: "layer2" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(0, "e", {}, str("d")),
          disagreements: {
            layer1: { expected: str("b"), actual: str("a"), to: str("c") },
            layer2: { expected: str("d"), actual: str("c"), to: str("e") },
          },
        },
      },
    });
  });

  it("metadata agreement", () => {
    type M = { foo: Str; bar: Num; humle: Str; dumle: Str };

    const x = Automerge.change(Automerge.from(document<M>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {
        foo: str("x"),
        bar: num(1),
        humle: str("one"),
        dumle: str("two"),
      });
      doc.layers.layer1 = layer<M>();
      doc.layers.layer1[0] = strn(
        0,
        "a",
        { foo: str("z"), bar: num(2), humle: str("two"), dumle: str("three") },
        str("a"),
        {
          foo: str("x"),
          bar: num(1),
          humle: str("one"),
        }
      );

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(
            0,
            "a",
            {
              foo: str("z"),
              bar: num(2),
              humle: str("two"),
              dumle: str("three"),
            },
            str("a"),
            {
              foo: str("x"),
              bar: num(1),
              humle: str("one"),
            }
          ),
        },
      },
    });
  });

  it("metadata disagreement", () => {
    type M = { foo: Str; bar: Num; humle: Str; dumle: Str };

    const x = Automerge.change(Automerge.from(document<M>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {
        foo: str("x"),
        bar: num(1),
        humle: str("one"),
        dumle: str("two"),
      });
      doc.layers.layer1 = layer<M>();
      doc.layers.layer1[0] = strn(
        0,
        "a",
        { foo: str("z"), bar: num(3), humle: str("two"), dumle: str("three") },
        str("a"),
        {
          foo: str("y"),
          bar: num(2),
          humle: str("one"),
        }
      );

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(
            0,
            "a",
            {
              foo: str("z"),
              bar: num(3),
              humle: str("two"),
              dumle: str("three"),
            },
            str("a"),
            {
              foo: str("y"),
              bar: num(2),
              humle: str("one"),
            }
          ),
          disagreements: {
            layer1: {
              metadata: {
                expected: {
                  foo: str("y"),
                  bar: num(2),
                },
                actual: {
                  foo: str("x"),
                  bar: num(1),
                },
                to: {
                  foo: str("z"),
                  bar: num(3),
                },
              },
            },
          },
        },
      },
    });
  });

  it("disagreement, expected undefined was set", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = strn(0, "a", {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "c", {});

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(0, "c", {}),
          disagreements: {
            layer1: { expected: undefined, actual: str("a"), to: str("c") },
          },
        },
      },
    });
  });

  it("agreement, expected undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "a", {});

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: strn(0, "a", {}),
      },
    });
  });

  it("disagreement, expected value was undefined", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = strn(0, "c", {}, str("b"));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...strn(0, "c", {}, str("b")),
          disagreements: {
            layer1: { expected: str("b"), actual: undefined, to: str("c") },
          },
        },
      },
    });
  });

  it("sequence agreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = seqn(0, [1, 2, 3], {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = seqn(0, [3, 2, 1], {}, seq([1, 2, 3]));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: seqn(0, [3, 2, 1], {}, seq([1, 2, 3])),
      },
    });
  });

  it("sequence disagreement", () => {
    const x = Automerge.change(Automerge.from(document<{}>()), (doc) => {
      doc.layers.base[0] = seqn(0, [1, 2, 3], {});

      doc.layers.layer1 = layer<{}>();

      doc.layers.layer1[0] = seqn(0, [3, 2, 1], {}, seq([1, 3, 2]));

      doc.compositions.default = {
        label: "base",
        layers: [{ label: "layer1" }],
      };
    });

    expect(proj(x)).toEqual({
      nodes: {
        0: {
          ...seqn(0, [3, 2, 1], {}, seq([1, 3, 2])),
          disagreements: {
            layer1: {
              expected: seq([1, 3, 2]),
              actual: seq([1, 2, 3]),
              to: seq([3, 2, 1]),
            },
          },
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
      doc.layers.base[0] = strn(0, "a", {});
    });
    b = Automerge.change(b, (doc) => {
      doc.layers.base[0] = strn(0, "b", {});
    });
    c = Automerge.change(c, (doc) => {
      doc.layers.base[0] = strn(0, "c", {});
    });

    a = Automerge.merge(a, b);
    a = Automerge.merge(a, c);

    expect(proj(a)).toEqual({
      nodes: {
        0: strn(0, "c", {}),
      },
      simultaneities: {
        0: {
          aa: strn(0, "a", {}),
          bb: strn(0, "b", {}),
          cc: strn(0, "c", {}),
        },
      },
    });
  });

  it("simultaneities on node", () => {
    // By adding the actor ID statically, the chosen value will be consistent
    let a = Automerge.from(document<{ author: Str; date: Str }>(), {
      actorId: "aa",
    });

    a = Automerge.change(a, (doc) => {
      doc.layers.base[0] = strn(0, "a", {
        author: str("Mrs A"),
        date: str("2020-10-08"),
      });
    });

    let b = Automerge.merge(Automerge.init<Document<{ author: Str }>>("bb"), a);

    let c = Automerge.merge(Automerge.init<Document<{ author: Str }>>("cc"), a);

    a = Automerge.change(a, (doc) => {
      doc.layers.base[0].value = "A";
    });

    b = Automerge.change(b, (doc) => {
      doc.layers.base[0].value = "B";
      doc.layers.base[0].metadata.author = str("Mr B");
    });

    c = Automerge.change(c, (doc) => {
      doc.layers.base[0].value = "C";
      doc.layers.base[0].metadata.author = str("Dr C");
    });

    a = Automerge.merge(a, b);
    a = Automerge.merge(a, c);

    expect(proj(a)).toEqual({
      nodes: {
        0: {
          ...strn(0, "C", { author: str("Dr C"), date: str("2020-10-08") }),
          simultaneities: {
            aa: {
              value: "A",
            },
            bb: {
              value: "B",
              metadata: { author: str("Mr B") },
            },
            cc: {
              value: "C",
              metadata: { author: str("Dr C") },
            },
          },
        },
      },
    });
  });
});

import { seq, sym, num, str, dis } from "./core";
import { proj } from "./proj";
import { trackedLabel } from "./constants";

const testDoc = () => ({
  0: seq(1, 2, 3),
  1: sym("+"),
  2: num(1),
  3: num(2),

  layer1: {
    2: num(11),
    3: num(21),
    layer1_1: {
      3: num(211),
      [trackedLabel]: {
        3: num(21),
      },
    },
    [trackedLabel]: {
      2: num(1),
      3: num(2),
    },
  },

  layer2: { 2: num(12) },
});

describe("proj", () => {
  it("only base layer", () => {
    expect(proj(testDoc())).toEqual({
      nodes: {
        0: seq(1, 2, 3),
        1: sym("+"),
        2: num(1),
        3: num(2),
      },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("layer with sublayers", () => {
    const projection = proj(testDoc(), [["layer1", ["layer1_1"]]]);
    expect(projection).toEqual({
      nodes: { 0: seq(1, 2, 3), 1: sym("+"), 2: num(11), 3: num(211) },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("works with layers only existing in stack", () => {
    const projection = proj(testDoc(), [
      ["layer1", ["layer_y", "layer1_1", "layer_z"]],
      "layer_x",
    ]);
    expect(projection).toEqual({
      nodes: {
        0: seq(1, 2, 3),
        1: sym("+"),
        2: num(11),
        3: num(211),
      },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("root replacement", () => {
    const d = {
      0: str("a"),
      replacement: { 0: str("b"), [trackedLabel]: { 0: str("a") } },
    };

    expect(proj(d, ["replacement"])).toEqual({
      nodes: {
        0: str("b"),
      },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("metalayers", () => {
    const d = {
      0: seq(1, 2),
      1: str("a"),
      2: str("b"),
      m$descr: { 1: str("small a"), 2: str("small b") },
      m$ts: {
        1: num(1588321340608),
        2: num(1588321366606),
      },
      alt: {
        2: str("B"),
        m$descr: { 2: str("big b") },
        [trackedLabel]: { 2: str("b") },
      },
    };

    const result = proj(d, ["alt"]);

    expect(result).toEqual({
      nodes: {
        0: seq(1, 2),
        1: str("a"),
        2: str("B"),
      },
      metadata: {
        descr: {
          1: str("small a"),
          2: str("big b"),
        },
        ts: {
          1: num(1588321340608),
          2: num(1588321366606),
        },
      },
      simultaneities: {},
      disagreements: {},
    });
  });

  it("agreement", () => {
    const x = {
      0: str("a"),
      layer1: {
        0: str("b"),
        [trackedLabel]: { 0: str("a") },
      },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: { 0: str("b") },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  // TODO will not support this for now. Not sure it is right anyway.
  xit("agreement of two equal mappings", () => {
    const x = {
      0: str("a"),
      layer1: {
        0: str("b"),
        [trackedLabel]: { 0: str("a") },
      },
      layer2: {
        0: str("b"),
        [trackedLabel]: { 0: str("a") },
      },
    };

    const res = proj(x, ["layer1", "layer2"]);
    expect(res).toEqual({
      nodes: { 0: str("b") },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("disagreement", () => {
    const x = {
      0: str("a"),
      layer1: {
        0: str("c"),
        [trackedLabel]: { 0: str("b") },
      },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: { 0: str("c") },
      metadata: {},
      simultaneities: {},
      disagreements: { 0: dis(str("b"), str("a"), str("c")) },
    });
  });

  it("disagreement, expected undefined was set", () => {
    const x = {
      0: str("a"),
      layer1: { 0: str("c") },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: {
        0: str("c"),
      },
      metadata: {},
      simultaneities: {},
      disagreements: { 0: dis(undefined, str("a"), str("c")) },
    });
  });

  it("agreement, expected undefined", () => {
    const x = {
      layer1: { 0: str("a") },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: { 0: str("a") },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("disagreement, expected value was undefined", () => {
    const x = {
      layer1: {
        0: str("c"),
        [trackedLabel]: { 0: str("b") },
      },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: { 0: str("c") },
      metadata: {},
      simultaneities: {},
      disagreements: { 0: dis(str("b"), undefined, str("c")) },
    });
  });

  it("sequence agreement", () => {
    const x = {
      0: seq(1, 2, 3),
      layer1: {
        0: seq(3, 2, 1),
        [trackedLabel]: { 0: seq(1, 2, 3) },
      },
    };

    expect(proj(x, ["layer1"])).toMatchObject({
      nodes: { 0: seq(3, 2, 1) },
      metadata: {},
      simultaneities: {},
      disagreements: {},
    });
  });

  it("sequence disagreement", () => {
    const x = {
      0: seq(1, 2, 3),
      layer1: {
        0: seq(3, 2, 1),
        [trackedLabel]: { 0: seq(1, 3, 2) },
      },
    };

    expect(proj(x, ["layer1"])).toEqual({
      nodes: { 0: seq(3, 2, 1) },
      metadata: {},
      simultaneities: {},
      disagreements: { 0: dis(seq(1, 3, 2), seq(1, 2, 3), seq(3, 2, 1)) },
    });
  });
});

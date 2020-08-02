import { num, sym, str, nil, seq, sim, dis } from "./core";
import { valswitch } from "./valswitch";
import { treeOf } from "./tree-of";
import { proj } from "./proj";
import { NodePresenter, NodeValue, PresentationNode, Label } from "./types";

describe("treeOf", () => {
  it("creates a tree with default presenter", () => {
    expect(
      treeOf(
        proj({
          0: seq(1, 2, 3),
          1: sym("+"),
          2: seq(4, 5),
          3: num(200),
          4: sym("inc"),
          5: num(10),
        })
      )
    ).toEqual([sym("+"), [sym("inc"), num(10)], num(200)]);
  });

  it("Handles nil values", () => {
    expect(treeOf(proj({ 0: nil }))).toEqual(nil);
  });

  it("creates a tree with a custom root node", () => {
    const res = treeOf(
      proj({ 3: seq(4, 5), 4: str("a"), 5: str("b") }),
      undefined,
      3
    );
    expect(res).toEqual(["a", "b"]);
  });

  it("passes presentation nodes to the presenter", () => {
    const expected: PresentationNode<PresentationNode> = {
      label: 0,
      value: seq(1, 2),
      items: [
        {
          value: sym("inc"),
          label: 1,
          metadata: { type: sym("func") },
          pos: 0,
          parent: 0,
          disagreement: {
            expected: sym("+1"),
            actual: sym("inc1"),
            to: sym("inc"),
          },
        },
        {
          value: num(10),
          label: 2,
          metadata: { type: sym("number") },
          pos: 1,
          parent: 0,
          simultaneities: [num(11), num(10)],
        },
      ],
      metadata: { type: sym("call") },
    };

    expect(
      // TODO find out how to replace the any type
      treeOf<PresentationNode<any>>(
        {
          nodes: { 0: seq(1, 2), 1: sym("inc"), 2: num(10) },
          metadata: {
            type: { 0: sym("call"), 1: sym("func"), 2: sym("number") },
          },
          simultaneities: { 2: sim(num(11), num(10)) },
          disagreements: { 1: dis(sym("+1"), sym("inc1"), sym("inc")) },
        },
        (n) => n
      )
    ).toEqual(expected);
  });

  it("uses a custom node presenter", () => {
    type TreeNode = {
      label: Label;
      type?: NodeValue;
      value: NodeValue | TreeNode[];
      pos?: number;
      parent?: Label;
    };

    const presenter: NodePresenter<TreeNode> = ({
      value,
      items,
      label,
      pos,
      parent,
      metadata: { type },
    }: PresentationNode<TreeNode>): TreeNode =>
      valswitch<TreeNode>({
        seq: (_, items): TreeNode => ({
          label,
          pos,
          parent,
          type,
          value: items,
        }),
        _: (v): TreeNode => ({ label, pos, parent, type, value: v }),
      })(value, items);

    const res = treeOf<TreeNode>(
      proj({
        0: seq("op", 2, 3),
        op: sym("+"),
        2: num(10),
        3: num(20),
        m$type: {
          0: sym("call"),
          2: sym("number"),
          3: sym("number"),
          op: sym("function"),
        },
      }),
      presenter
    );

    expect(res).toEqual({
      label: 0,
      type: sym("call"),
      value: [
        {
          label: "op",
          type: sym("function"),
          value: sym("+"),
          pos: 0,
          parent: 0,
        },
        { label: 2, type: sym("number"), value: num(10), pos: 1, parent: 0 },
        { label: 3, type: sym("number"), value: num(20), pos: 2, parent: 0 },
      ],
    });
  });
});

import { num, sym, str, nil, seq, sim, dis } from "./core";
import { valswitch } from "./valswitch";
import { treeOf } from "./tree-of";
import {
  NodePresenter,
  NodeValue,
  PresentationNode,
  Label,
  Sym,
  Metadata,
} from "./types";

describe("treeOf", () => {
  it("creates a tree with default presenter", () => {
    expect(
      treeOf({
        nodes: {
          0: { label: 0, value: seq(1, 2, 3) },
          1: { label: 1, value: sym("+") },
          2: { label: 2, value: seq(4, 5) },
          3: { label: 3, value: num(200) },
          4: { label: 4, value: sym("inc") },
          5: { label: 5, value: num(10) },
        },
      })
    ).toEqual([sym("+"), [sym("inc"), num(10)], num(200)]);
  });

  it("Handles nil values", () => {
    expect(treeOf({ nodes: { 0: { label: 0, value: nil } } })).toEqual(nil);
  });

  it("creates a tree with a custom root node", () => {
    const res = treeOf(
      {
        nodes: {
          3: { label: 3, value: seq(4, 5) },
          4: { label: 4, value: str("a") },
          5: { label: 5, value: str("b") },
        },
      },
      undefined,
      3
    );
    expect(res).toEqual(["a", "b"]);
  });

  type TestNode<M extends Metadata> = PresentationNode<M, ITestNode<M>>;
  interface ITestNode<M extends Metadata> extends TestNode<M> {}
  type TestMeta = { type?: Sym };

  it("passes presentation nodes to the presenter", () => {
    const expected: TestNode<TestMeta> = {
      label: 0,
      value: seq(1, 2),
      items: [
        {
          value: sym("inc"),
          label: 1,
          metadata: { type: sym("func") },
          pos: 0,
          parent: 0,
          disagreement: [
            "dis",
            {
              expected: sym("+1"),
              actual: sym("inc1"),
              to: sym("inc"),
            },
          ],
        },
        {
          value: num(10),
          label: 2,
          metadata: { type: sym("number") },
          pos: 1,
          parent: 0,
          simultaneities: ["sim", [num(11), num(10)]],
        },
      ],
      metadata: { type: sym("call") },
    };

    const res = treeOf<TestMeta, TestNode<TestMeta>>(
      {
        nodes: {
          0: { label: 0, value: seq(1, 2), metadata: { type: sym("call") } },
          1: {
            label: 1,
            value: sym("inc"),
            metadata: { type: sym("func") },
            disagreement: dis({
              expected: sym("+1"),
              actual: sym("inc1"),
              to: sym("inc"),
            }),
          },
          2: {
            label: 2,
            value: num(10),
            metadata: {
              type: sym("number"),
            },
            simultaneities: sim(num(11), num(10)),
          },
        },
      },
      (n) => n
    );

    expect(res).toEqual(expected);
  });

  it("uses a custom node presenter", () => {
    type TreeNode = {
      label: Label;
      type?: NodeValue;
      value: NodeValue | TreeNode[];
      pos?: number;
      parent?: Label;
    };

    const presenter: NodePresenter<TestMeta, TreeNode> = ({
      value,
      items,
      label,
      pos,
      parent,
      metadata: { type } = {},
    }: PresentationNode<TestMeta, TreeNode>): TreeNode =>
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

    const res = treeOf<TestMeta, TreeNode>(
      {
        nodes: {
          0: {
            label: 0,
            value: seq("op", 2, 3),
            metadata: { type: sym("call") },
          },
          op: {
            label: "op",
            value: sym("+"),
            metadata: {
              type: sym("function"),
            },
          },
          2: { label: 2, value: num(10), metadata: { type: sym("number") } },
          3: { label: 3, value: num(20), metadata: { type: sym("number") } },
        },
      },
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

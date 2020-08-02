import { num, sym } from "./core";
import { layers } from "./layers";

describe("layers", () => {
  it("return layers but not nodes", () => {
    const p = {
      a: sym("A"),
      two: num(2),
      c: { a: sym("AA") },
      d: { a: sym("a") },
    };

    expect([...layers(p)]).toEqual([
      {
        label: "c",
        layer: { a: sym("AA") },
      },
      {
        label: "d",
        layer: { a: sym("a") },
      },
    ]);
  });
});

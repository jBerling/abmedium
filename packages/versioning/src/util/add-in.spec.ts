import { addIn } from "./add-in";
import { num, Layer } from "@abrovink/abmedium";

test("addIn", () => {
  const layer: Layer = { a: num(1) };

  addIn(layer, ["alt", "sub-alt", "b"], num(2));

  expect(layer).toEqual({
    a: num(1),
    alt: { "sub-alt": { b: num(2) } },
  });
});

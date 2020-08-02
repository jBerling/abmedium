import { seq, sym, str, num, sim, dis, nil } from "./core";
import { editvalOf } from "./editvalOf";

test("editvalOf", () => {
  expect(
    [
      seq(1, "two", 3),
      sym("ab"),
      str("abc"),
      num("1001"),
      nil,
      sim(str("a"), str("b")),
      dis(str("a"), str("b"), str("c")),
    ].map(editvalOf)
  ).toMatchObject([
    [1, "two", 3],
    "ab",
    "abc",
    "1001",
    "",
    ["a", "b"],
    { expected: "a", actual: "b", to: "c" },
  ]);
});

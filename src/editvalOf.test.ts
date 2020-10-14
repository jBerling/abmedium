import { seq, sym, str, num, nil } from "./core";
import { editvalOf } from "./editvalOf";

test("editvalOf", () => {
  expect(
    [seq([1, "two", 3]), sym("ab"), str("abc"), num("1001"), nil].map(editvalOf)
  ).toMatchObject([[1, "two", 3], "ab", "abc", "1001", ""]);
});

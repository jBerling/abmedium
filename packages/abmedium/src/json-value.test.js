const {
  layer,
  sym,
  root,
  seq,
  str,
  nil,
  num,
  sim,
  mapping,
} = require('./core');

const { jsonOf, fromJson } = require('./json-value');

describe('Json value', () => {
  it('serializes and deserializes', () => {
    const value = layer({
      [root]: seq([1, 2, 3, 4, 5]),
      1: sym('foo'),
      2: num(333),
      3: seq([4, 5, 6]),
      4: str('lorem ipsum'),
      5: nil,
      6: sim([str('humle'), str('dumle')]),
      sub: layer({ 2: mapping(num(333), num(334)) }),
    });

    const res = fromJson(jsonOf(value));
    expect(res).toEqual(value);
  });
});

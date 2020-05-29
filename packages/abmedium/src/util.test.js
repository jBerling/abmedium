const { addIn } = require('./util');

describe('util', () => {
  test('addIn', () => {
    expect(
      addIn({ a: 1, b: { c: 2, d: { e: 3 } } }, ['b', 'd', 'f', 'g'], 'perfect')
    ).toEqual({ a: 1, b: { c: 2, d: { e: 3, f: { g: 'perfect' } } } });
  });
});

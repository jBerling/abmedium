const { num, layer, sym, document } = require('./core');
const proj = require('./proj');
const nodes = require('./nodes');

describe('nodes', () => {
  it('return nodes but not layers', () => {
    const d = document({
      a: sym('A'),
      two: num(2),
      c: layer({ a: sym('AA') }),
      type: layer({
        a: 'string',
        two: 'number',
      }),
      ts: layer({
        a: '202007-14T23:34Z',
        two: '202007-14T22:23Z',
      }),
    });

    expect([...nodes(proj(d, [], ['type', 'ts']))]).toEqual([
      {
        handle: 'a',
        value: sym('A'),
        metadata: { type: 'string', ts: '202007-14T23:34Z' },
      },
      {
        handle: 'two',
        value: num(2),
        metadata: { type: 'number', ts: '202007-14T22:23Z' },
      },
    ]);
  });
});

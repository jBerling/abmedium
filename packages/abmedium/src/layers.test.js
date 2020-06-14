const { num, layer, sym } = require('./core');
const document = require('./document');
const layers = require('./layers');

describe('layers', () => {
  it('return layers but not nodes', () => {
    const d = document('text');
    d.replace(
      layer({
        a: sym('A'),
        two: num(2),
        c: layer({ a: sym('AA') }),
        d: layer({ a: sym('a') }),
      })
    );

    expect([...layers(d.value())]).toEqual([
      {
        handle: 'c',
        layer: layer({ a: sym('AA') }),
      },
      {
        handle: 'd',
        layer: layer({ a: sym('a') }),
      },
    ]);
  });
});

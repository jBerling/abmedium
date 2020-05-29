const { seq, sym, layer, sim } = require('./core');
const { merged, replaced } = require('./combining');

describe('combining', () => {
  it('it replaces the values of one object with another', () => {
    const a = layer({
      a: seq(['b', 'c']),
      b: sym('b'),
      c: sym('c'),
      alt: layer({ b: sym('bx'), c: sym('cx') }),
    });

    const b = layer({
      c: sym('C'),
      d: seq(['e', 'f']),
      e: sym('e'),
      f: sym('f'),
      alt: layer({ c: sym('CX'), e: sym('ex'), f: sym('fx') }),
    });

    replaced(a, b);

    expect(a).toEqual(
      layer({
        a: seq(['b', 'c']),
        b: sym('b'),
        c: sym('C'),
        d: seq(['e', 'f']),
        e: sym('e'),
        f: sym('f'),
        alt: layer({
          b: sym('bx'),
          c: sym('CX'),
          e: sym('ex'),
          f: sym('fx'),
        }),
      })
    );
  });

  it('merges two objects', () => {
    const a = layer({
      a: seq(['b', 'c']),
      b: sym('b'),
      c: sym('c'),
      alt: layer({ b: sym('bx'), c: sym('cx') }),
    });

    const b = layer({
      c: sym('C'),
      d: seq(['e', 'f']),
      e: sym('e'),
      f: sym('f'),
      alt: layer({ c: sym('CX'), e: sym('ex'), f: sym('fx') }),
    });

    merged(a, b);

    expect(a).toEqual(
      layer({
        a: seq(['b', 'c']),
        b: sym('b'),
        c: sim([sym('c'), sym('C')]),
        d: seq(['e', 'f']),
        e: sym('e'),
        f: sym('f'),
        alt: layer({
          b: sym('bx'),
          c: sim([sym('cx'), sym('CX')]),
          e: sym('ex'),
          f: sym('fx'),
        }),
      })
    );
  });
});

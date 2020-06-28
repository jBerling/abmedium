const { seq, sym, layer, sim } = require('./core');
const { merged, replaced } = require('./combining');

describe('combining', () => {
  it('it replaces the values of one object with another', () => {
    const a = layer({
      a: seq('b', 'c'),
      b: sym('b'),
      c: sym('c'),
      alt: layer({ b: sym('bx'), c: sym('cx') }),
    });

    const b = layer({
      c: sym('C'),
      d: seq('e', 'f'),
      e: sym('e'),
      f: sym('f'),
      alt: layer({ c: sym('CX'), e: sym('ex'), f: sym('fx') }),
    });

    const res = replaced(a, b);

    expect(res).toEqual(
      layer({
        a: seq('b', 'c'),
        b: sym('b'),
        c: sym('C'),
        d: seq('e', 'f'),
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

  it('merges objects', () => {
    const a = layer({
      a: seq('b', 'c'),
      b: sym('b'),
      c: sym('c'),
      alt: layer({ b: sym('bx'), c: sym('cx') }),
    });

    const b = layer({
      c: sym('C'),
      d: seq('e', 'f'),
      e: sym('e'),
      f: sym('f'),
      alt: layer({ c: sym('CX'), e: sym('ex'), f: sym('fx') }),
    });

    const c = layer({
      c: sym('CC'),
    });

    let res = merged(a, b);
    res = merged(res, c);

    expect(res).toEqual(
      layer({
        a: seq('b', 'c'),
        b: sym('b'),
        c: sim(sym('c'), sym('C'), sym('CC')),
        d: seq('e', 'f'),
        e: sym('e'),
        f: sym('f'),
        alt: layer({
          b: sym('bx'),
          c: sim(sym('cx'), sym('CX')),
          e: sym('ex'),
          f: sym('fx'),
        }),
      })
    );
  });
});

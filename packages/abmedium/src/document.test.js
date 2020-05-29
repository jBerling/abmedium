const { num, nil, root, seq, str, sym, LAYER } = require('./core');
const document = require('./document');

describe('Document', () => {
  it('adds handle-value pair', () => {
    const d = document('test');
    d.add('a', num(1));
    expect(d.value()).toMatchObject({ a: num(1) });
  });

  it('adds nil values', () => {
    const d = document('test');
    d.add(root, nil);
    expect(d.value()).toMatchObject({ 0: nil });
  });

  it('adds layers', () => {
    const d = document('test');
    d.add(['a', 'b'], sym('b'));
    expect(d.value()).toMatchObject({
      a: { [LAYER]: true, b: sym('b') },
      [LAYER]: true,
    });
  });

  const doc = () => {
    const d = document('test');
    d.add(root, seq(['op', 2, 3]));
    d.add(['type', root], str('call'));
    d.add('op', sym('+'));
    d.add(['type', 'op'], str('function'));
    d.add(2, num(10));
    d.add(['type', 2], str('number'));
    d.add(3, seq([4, 5, 6]));
    d.add(['type', 3], str('call'));
    d.add(4, sym('-'));
    d.add(['type', 4], str('function'));
    d.add(5, num(20));
    d.add(['type', 5], str('number'));
    d.add(6, num(30));
    d.add(['type', 6], str('number'));
    return d;
  };

  it('computes document value', () => {
    const d = doc();

    expect(d.value()).toMatchObject({
      [root]: seq([str('op'), num(2), num(3)]),
      op: sym('+'),
      2: num(10),
      3: seq([4, 5, 6]),
      4: sym('-'),
      5: num(20),
      6: num(30),
    });
  });
});

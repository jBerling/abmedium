const {
  document,
  pres,
  proj,
  num,
  sym,
  str,
  seq,
  nil,
  root,
} = require('./core');

describe('The core module', () => {
  it('adds handle-value pair', () => {
    const d = document('test');
    d.add('a', num(1));
    expect(d.value()).toMatchObject({ a: num(1) });
  });

  it('adds nil values', () => {
    const d = document();
    d.add(root, nil);
    expect(d.value()).toMatchObject({ 0: nil });
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

  it('presents document', () => {
    const d = doc();
    expect(pres(d.value())).toEqual([
      sym('+'),
      num(10),
      [sym('-'), num(20), num(30)],
    ]);
  });

  it('presents nil values', () => {
    const d = document();
    d.add(0, nil);
    expect(pres(d.value())).toEqual(nil);
  });

  it('presents document with metalayer using node presenter', () => {
    const d = doc();

    const presenter = (value, handle, { type, parent, pos }) => {
      return { handle, value, type, parent, pos };
    };

    const res = pres(proj(d, [], ['type']), presenter);

    expect(res).toEqual({
      handle: 0,
      type: 'call',
      value: [
        { handle: 'op', type: 'function', value: sym('+'), pos: 0, parent: 0 },
        { handle: 2, type: 'number', value: 10, pos: 1, parent: 0 },
        {
          handle: 3,
          parent: 0,
          pos: 2,
          type: 'call',
          value: [
            { handle: 4, type: 'function', value: sym('-'), pos: 0, parent: 3 },
            { handle: 5, type: 'number', value: 20, pos: 1, parent: 3 },
            { handle: 6, type: 'number', value: 30, pos: 2, parent: 3 },
          ],
        },
      ],
    });
  });

  it('throws when presenting fragment', () => {
    const f = document('fragment');
    f.add(1, str('foo'));
    expect(() => pres(f.value())).toThrow(
      new Error('A fragment can not be presented. The document has no root.')
    );
  });

  it('throws not when presenting nil as root', () => {
    const f = document('fragment');
    f.add(0, nil);
    pres(f.value());
  });

  it('syncs', () => {
    const d1 = document('1');
    const delta1 = d1.add(2, num(22));
    const d2 = document('2');
    d2.add(root, seq([1, 2]));
    d2.add(1, sym('inc'));
    d2.sync(delta1);
    expect(d2.value()).toMatchObject({
      [root]: seq([1, 2]),
      1: sym('inc'),
      2: num(22),
    });
  });
});

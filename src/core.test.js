const { document, pres, sym, root } = require('./core');

describe('The core module', () => {
  it('add handle-value pair', () => {
    const d = document('test');
    d.add('a', 1);
    expect(d.value()).toMatchObject({ a: 1 });
  });

  const doc = () => {
    const d = document('test');
    d.add(root, ['op', 2, 3]);
    d.add('op', sym('+'));
    d.add(2, 10);
    d.add(3, [4, 5, 6]);
    d.add(4, sym('-'));
    d.add(5, 20);
    d.add(6, 30);
    return d;
  };

  it('computes document value', () => {
    const d = doc();

    expect(d.value()).toMatchObject({
      [root]: ['op', 2, 3],
      op: sym('+'),
      2: 10,
      3: [4, 5, 6],
      4: sym('-'),
      5: 20,
      6: 30,
    });
  });

  it('presents document', () => {
    const d = doc();
    expect(pres(d.value())).toEqual([sym('+'), 10, [sym('-'), 20, 30]]);
  });

  it('presents document using node constructor', () => {
    const d = doc();

    const constr = (value, handle) => {
      return { handle, value };
    };

    const res = pres(d.value(), constr);

    expect(res).toEqual({
      handle: 0,
      value: [
        { handle: 'op', value: sym('+') },
        { handle: 2, value: 10 },
        {
          handle: 3,
          value: [
            { handle: 4, value: sym('-') },
            { handle: 5, value: 20 },
            { handle: 6, value: 30 },
          ],
        },
      ],
    });
  });

  it('throws when presenting fragment', () => {
    const f = document('fragment');
    f.add(1, 'foo');
    expect(() => pres(f.value())).toThrow(
      new Error('A fragment can not be presented. The document has no root.')
    );
  });

  it('syncs', () => {
    const d1 = document('1');
    const delta1 = d1.add(2, 22);
    const d2 = document('2');
    d2.add(root, [1, 2]);
    d2.add(1, sym('inc'));
    d2.sync(delta1);
    expect(d2.value()).toMatchObject({
      [root]: [1, 2],
      1: sym('inc'),
      2: 22,
    });
  });
});

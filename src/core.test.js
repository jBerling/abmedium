const {
  document,
  pres,
  proj,
  sym,
  sim,
  disagreement,
  root,
  valueTypeof,
} = require('./core');

describe('The core module', () => {
  it('add handle-value pair', () => {
    const d = document('test');
    d.add('a', 1);
    expect(d.value()).toMatchObject({ a: 1 });
  });

  const doc = () => {
    const d = document('test');
    d.add(root, ['op', 2, 3]);
    d.add(['type', root], 'call');
    d.add('op', sym('+'));
    d.add(['type', 'op'], 'function');
    d.add(2, 10);
    d.add(['type', 2], 'number');
    d.add(3, [4, 5, 6]);
    d.add(['type', 3], 'call');
    d.add(4, sym('-'));
    d.add(['type', 4], 'function');
    d.add(5, 20);
    d.add(['type', 5], 'number');
    d.add(6, 30);
    d.add(['type', 6], 'number');
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

  test('valueType', () => {
    expect(valueTypeof(sym('a'))).toEqual('sym');
    expect(valueTypeof([])).toEqual('sequence');
    expect(valueTypeof('')).toEqual('string');
    expect(valueTypeof(0)).toEqual('number');
    expect(valueTypeof(sim(['a', 'b']))).toEqual('sim');
    expect(valueTypeof(disagreement('a', 'b', 'c'))).toEqual('disagreement');
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

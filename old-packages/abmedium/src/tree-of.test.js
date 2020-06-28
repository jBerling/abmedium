const { proj, num, sym, str, nil, root, seq } = require('./core');

const document = require('./document');

const treeOf = require('./tree-of');

describe('treeOf', () => {
  const doc = () => {
    const d = document('test');
    d.add(root, seq('op', 2, 3));
    d.add(['type', root], str('call'));
    d.add('op', sym('+'));
    d.add(['type', 'op'], str('function'));
    d.add(2, num(10));
    d.add(['type', 2], str('number'));
    d.add(3, seq(4, 5, 6));
    d.add(['type', 3], str('call'));
    d.add(4, sym('-'));
    d.add(['type', 4], str('function'));
    d.add(5, num(20));
    d.add(['type', 5], str('number'));
    d.add(6, num(30));
    d.add(['type', 6], str('number'));
    return d;
  };

  it('creates tree from root', () => {
    const d = doc();
    expect(treeOf(d.value())).toEqual([
      sym('+'),
      num(10),
      [sym('-'), num(20), num(30)],
    ]);
  });

  it('Handles nil values', () => {
    const d = document('test');
    d.add(0, nil);
    expect(treeOf(d.value())).toEqual(nil);
  });

  it('create tree from document with metalayers using node presenter', () => {
    const d = doc();

    const presenter = (value, handle, { type, parent, pos }) => {
      return { handle, value, type, parent, pos };
    };

    const res = treeOf(proj(d, [], ['type']), presenter);

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

  it('creates a tree with a custom root node', () => {
    const d = doc();
    const res = treeOf(proj(d), undefined, 3);
    expect(res).toEqual([sym('-'), num(20), num(30)]);
  });

  it('throws not when creating a tree with nil as root', () => {
    const f = document('fragment');
    f.add(0, nil);
    treeOf(f.value());
  });
});

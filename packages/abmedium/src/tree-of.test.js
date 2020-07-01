const {
  num,
  sym,
  str,
  nil,
  seq,
  document,
  layer,
  mapping,
  sim,
} = require('./core');

const treeOf = require('./tree-of');
const proj = require('./proj');

describe('treeOf', () => {
  const doc = () => {
    return document({
      0: seq('op', 2, 3),
      op: sym('+'),
      2: num(10),
      3: seq(4, 5, 6),
      4: sym('-'),
      5: num(20),
      6: num(30),
      alt: layer({
        6: mapping(num(32), num(31)),
      }),
      type: layer({
        0: str('call'),
        op: str('function'),
        2: str('number'),
        3: str('call'),
        4: str('function'),
        5: str('number'),
        6: str('number'),
      }),
    });
  };

  it('creates tree from root', () => {
    expect(treeOf(proj(doc()))).toEqual(
      seq(sym('+'), num(10), seq(sym('-'), num(20), num(30)))
    );
  });

  it('Handles nil values', () => {
    const d = document({ 0: nil });
    expect(treeOf(proj(d))).toEqual(nil);
  });

  it('create tree from document with metalayers using node presenter', () => {
    let d = { ...doc(), 5: sim(num(20), num(21)) };

    const presenter = (value, handle, { type, parent, pos }) => {
      return { handle, value, type, parent, pos };
    };

    const res = treeOf(proj(d, ['alt'], ['type']), presenter);

    expect(res).toEqual({
      handle: 0,
      type: 'call',
      value: seq(
        { handle: 'op', type: 'function', value: sym('+'), pos: 0, parent: 0 },
        { handle: 2, type: 'number', value: 10, pos: 1, parent: 0 },
        {
          handle: 3,
          parent: 0,
          pos: 2,
          type: 'call',
          value: seq(
            { handle: 4, type: 'function', value: sym('-'), pos: 0, parent: 3 },
            {
              handle: 5,
              parent: 3,
              pos: 1,
              type: 'number',
              value: [
                'sim',
                [
                  { handle: 5, type: 'number', value: 20, pos: 1, parent: 3 },
                  { handle: 5, type: 'number', value: 21, pos: 1, parent: 3 },
                ],
              ],
            },
            {
              handle: 6,
              type: 'number',
              pos: 2,
              parent: 3,
              value: [
                'dis',
                {
                  actual: {
                    handle: 6,
                    type: 'number',
                    value: 30,
                    pos: 2,
                    parent: 3,
                  },
                  expected: {
                    handle: 6,
                    type: 'number',
                    value: 31,
                    pos: 2,
                    parent: 3,
                  },
                  to: {
                    handle: 6,
                    type: 'number',
                    value: 32,
                    pos: 2,
                    parent: 3,
                  },
                },
              ],
            }
          ),
        }
      ),
    });
  });

  it('creates a tree with a custom root node', () => {
    const res = treeOf(proj(doc()), undefined, 3);
    expect(res).toEqual(seq(sym('-'), num(20), num(30)));
  });

  // TODO what does this test that is not tested in other tests?
  it('projection', () => {
    const d = document({
      0: seq(1, 2, 3),
      1: sym('+'),
      2: num(1),
      3: num(2),
      layer1: layer({
        2: num(11),
        3: num(21),
        layer1_1: layer({
          3: num(211),
        }),
      }),
      layer2: layer({ 2: num(12) }),
    });
    const projection = proj(d, [['layer1', ['layer1_1']]]);
    expect(treeOf(projection)).toMatchObject(seq(sym('+'), num(11), num(211)));
  });
});

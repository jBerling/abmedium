const {
  sym,
  sim,
  seq,
  seqItems,
  str,
  nil,
  num,
  disagreement,
  valtype,
  lengthOf,
  editvalOf,
} = require('./core');

describe('core', () => {
  test('valtype', () => {
    expect(valtype(sym('a'))).toEqual('sym');
    expect(valtype(seq())).toEqual('seq');
    expect(valtype(str(''))).toEqual('str');
    expect(valtype(num(0))).toEqual('num');
    expect(valtype(sim('a', 'b'))).toEqual('sim');
    expect(valtype(disagreement('a', 'b', 'c'))).toEqual('dis');
    expect(valtype(nil)).toEqual('nil');
  });

  test('valtype with conditional flag', () => {
    expect(valtype(sym('a'), 'sym')).toBe(true);
    expect(valtype(sym('a'), 'seq')).toBe(false);
    expect(valtype(seq(), 'seq')).toBe(true);
    expect(valtype(str(''), 'str')).toBe(true);
    expect(valtype(num(0), 'num')).toBe(true);
    expect(valtype(sim('a', 'b'), 'sim')).toBe(true);
    expect(valtype(disagreement('a', 'b', 'c'), 'dis')).toBe(true);
    expect(valtype(sym('a'), 'str', 'num', 'sym')).toBe(true);
    expect(valtype(nil, 'nil')).toBe(true);
  });

  test('valtype with switch flag', () => {
    const collected = [];
    const collect = t => v => collected.push([t, v]);
    valtype(seq(), { seq: collect('seq') });
    valtype(sym('a'), { sym: collect('sym') });
    valtype(str(''), { str: collect('str') });
    valtype(num(0), { num: collect('num') });
    valtype(sim('a', 'b'), { sim: collect('sim') });
    valtype(disagreement('a', 'b', 'c'), { dis: collect('dis') });
    valtype(sym('a'), { _: collect('_') });
    valtype(nil, { nil: collect('nil') });
    expect(collected).toMatchObject([
      ['seq', seq()],
      ['sym', sym('a')],
      ['str', str('')],
      ['num', num(0)],
      ['sim', sim('a', 'b')],
      ['dis', disagreement('a', 'b', 'c')],
      ['_', sym('a')],
      ['nil', nil],
    ]);
    expect(valtype(sym('a'), { sym: 'foo' })).toEqual('foo');
  });

  test('lengthOf', () => {
    expect(
      [
        seq(1, 2, 3),
        sym('ab'),
        str('abc'),
        num('1001'),
        nil,
        sim('a', 'b'),
        disagreement('a', 'b', 'c'),
      ].map(lengthOf)
    ).toMatchObject([3, 2, 3, 4, 0, NaN, NaN]);
  });

  test('editvalOf', () => {
    expect(
      [
        seq(1, 2, 3),
        sym('ab'),
        str('abc'),
        num('1001'),
        nil,
        sim('a', 'b'),
        disagreement('a', 'b', 'c'),
      ].map(editvalOf)
    ).toMatchObject([
      [1, 2, 3],
      'ab',
      'abc',
      '1001',
      '',
      ['a', 'b'],
      { expected: 'a', actual: 'b', to: 'c' },
    ]);
  });

  test('sim of sims', () => {
    expect(sim(sim('a', 'b'), 'c', sim('d', 'e'))).toEqual(
      sim('a', 'b', 'c', 'd', 'e')
    );
  });

  test('seq items', () => {
    expect(seqItems(seq(num(1), num(2)))).toEqual([num(1), num(2)]);
  });
});

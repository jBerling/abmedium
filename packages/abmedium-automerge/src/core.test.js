const {
  change,
  document,
  merge,
  txt,
  valtype,
  lengthOf,
  isEqual,
  num,
  sim,
  str,
  sym,
} = require('./core');

describe('core', () => {
  it('merges and creates simultaneities', () => {
    let documentA = document({ 0: num(42) });
    let documentB = document();
    documentB = merge(documentB, documentA);
    documentA = change(documentA, doc => {
      doc[0] = num(43);
    });
    documentB = change(documentB, doc => {
      doc[0] = num(44);
    });
    documentB = merge(documentB, documentA);

    expect(isEqual(documentB[0], sim(num(43), num(44)))).toBe(true);
  });

  describe('extended valtype', () => {
    test('type', () => {
      expect(valtype(txt('foo'))).toEqual('txt');
    });

    test('conditional', () => {
      expect(valtype(txt('foo'), 'txt')).toBe(true);
    });

    test('switch', () => {
      let res;
      valtype(txt('foo'), {
        txt: t => {
          res = t.toString();
        },
      });
      expect(res).toEqual('foo');
    });
  });

  test('extended lengthOf', () => {
    expect(lengthOf(txt('foo'))).toBe(3);
  });

  test('extended isEqual', () => {
    expect(isEqual(txt('foo'), txt('foo'))).toBe(true);
    expect(isEqual(txt('foo'), txt('bar'))).toBe(false);
    expect(isEqual(txt('foo'), str('foo'))).toBe(false);
    expect(isEqual(txt('foo'), sym('foo'))).toBe(false);
  });
});

const {
  proj,
  sym,
  document,
  pres,
  root,
  isLayer,
  seq,
  str,
  num,
} = require('./core');

describe('content layers', () => {
  const doc = () => {
    const d = document('base');
    d.add(root, seq([1, 2, 3]));
    d.add(1, sym('+'));
    d.add(2, num(1));
    d.add(3, num(2));
    d.add(['layer1', 2], num(11));
    d.add(['layer1', 3], num(21));
    d.add(['layer1', 'layer1_1', 3], num(211));
    d.add(['layer2', 2], num(12));
    return d;
  };

  it('value with layers', () => {
    const d = doc();
    expect(d.value()).toMatchObject({
      1: sym('+'),
      2: num(1),
      3: num(2),
      layer1: {
        2: num(11),
        3: num(21),
        layer1_1: { 3: num(211) },
      },
      layer2: {
        2: num(12),
      },
    });
    expect(isLayer(d.value())).toEqual(true);
    expect(isLayer(d.value().layer1)).toEqual(true);
    expect(isLayer(d.value().layer1.layer1_1)).toEqual(true);
  });

  describe('proj', () => {
    it('only base layer', () => {
      const d = doc();
      const projection = proj(d);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: num(1),
        3: num(2),
      });
      expect(projection.layer1).toEqual(undefined);
      expect(projection.layer2).toEqual(undefined);
    });

    it('one layer', () => {
      const d = doc();
      const projection = proj(d, ['layer2']);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: num(12),
        3: num(2),
      });
      expect(projection.layer1).toEqual(undefined);
      expect(projection.layer2).toEqual(undefined);
    });

    it('two sibling layers', () => {
      const d = doc();
      const projection = proj(d, ['layer1', 'layer2']);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: num(12),
        3: num(21),
      });

      const projection2 = proj(d, ['layer2', 'layer1']);
      expect(projection2).toMatchObject({
        1: sym('+'),
        2: num(11),
        3: num(21),
      });
    });

    it('layer with sublayers', () => {
      const d = doc();
      const projection = proj(d, [['layer1', ['layer1_1']]]);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: num(11),
        3: num(211),
      });
    });

    it('root replacement', () => {
      const d = document('test');
      d.add(root, str('a'));
      d.add(['replacement', root], str('b'));
      expect(proj(d, ['replacement'])).toMatchObject({
        [root]: str('b'),
      });
    });

    it('metalayers', () => {
      const d = document('test');
      d.add(root, seq([1, 2]));
      d.add(1, str('a'));
      d.add(['descr', 1], str('small a'));
      d.add(['ts', 1], num(1588321340608));
      d.add(2, str('b'));
      d.add(['descr', 2], str('small b'));
      d.add(['ts', 2], num(1588321366606));
      d.add(['alt', 2], str('B'));
      d.add(['alt', 'descr', 2], str('big b'));
      const result = proj(d, ['alt'], ['descr', 'ts']);
      expect(result).toMatchObject({
        [root]: seq([1, 2]),
        1: str('a'),
        2: str('B'),
        descr: {
          1: str('small a'),
          2: str('big b'),
        },
        ts: {
          1: num(1588321340608),
          // todo: ponder about the desired value in this case
          // Do we really want to keep the metavalue of a layer below,
          // if the value is not set?
          2: num(1588321366606),
        },
      });
    });
  });

  it('pres', () => {
    const d = doc();
    const projection = proj(d, [['layer1', ['layer1_1']]]);
    expect(pres(projection)).toMatchObject([sym('+'), num(11), num(211)]);
  });
});

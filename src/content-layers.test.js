const { proj, sym, document, pres, root, isLayer } = require('./core');

describe('content layers', () => {
  const doc = () => {
    const d = document('base');
    d.add(root, [1, 2, 3]);
    d.add(1, sym('+'));
    d.add(2, 1);
    d.add(3, 2);
    d.add(['layer1', 2], 11);
    d.add(['layer1', 3], 21);
    d.add(['layer1', 'layer1_1', 3], 211);
    d.add(['layer2', 2], 12);
    return d;
  };

  it('value with layers', () => {
    const d = doc();
    expect(d.value()).toMatchObject({
      1: sym('+'),
      2: 1,
      3: 2,
      layer1: {
        2: 11,
        3: 21,
        layer1_1: { 3: 211 },
      },
      layer2: {
        2: 12,
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
        2: 1,
        3: 2,
      });
      expect(projection.layer1).toEqual(undefined);
      expect(projection.layer2).toEqual(undefined);
    });

    it('one layer', () => {
      const d = doc();
      const projection = proj(d, ['layer2']);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: 12,
        3: 2,
      });
      expect(projection.layer1).toEqual(undefined);
      expect(projection.layer2).toEqual(undefined);
    });

    it('two sibling layers', () => {
      const d = doc();
      const projection = proj(d, ['layer1', 'layer2']);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: 12,
        3: 21,
      });

      const projection2 = proj(d, ['layer2', 'layer1']);
      expect(projection2).toMatchObject({
        1: sym('+'),
        2: 11,
        3: 21,
      });
    });

    it('layer with sublayers', () => {
      const d = doc();
      const projection = proj(d, [['layer1', ['layer1_1']]]);
      expect(projection).toMatchObject({
        1: sym('+'),
        2: 11,
        3: 211,
      });
    });

    it('root replacement', () => {
      const d = document('test');
      d.add(root, 'a');
      d.add(['replacement', root], 'b');
      expect(proj(d, ['replacement'])).toMatchObject({
        [root]: 'b',
      });
    });

    it('metalayers', () => {
      const d = document('test');
      d.add(root, [1, 2]);
      d.add(1, 'a');
      d.add(['descr', 1], 'small a');
      d.add(['ts', 1], 1588321340608);
      d.add(2, 'b');
      d.add(['descr', 2], 'small b');
      d.add(['ts', 2], 1588321366606);
      d.add(['alt', 2], 'B');
      d.add(['alt', 'descr', 2], 'big b');
      const result = proj(d, ['alt'], ['descr', 'ts']);
      expect(result).toMatchObject({
        [root]: [1, 2],
        1: 'a',
        2: 'B',
        descr: {
          1: 'small a',
          2: 'big b',
        },
        ts: {
          1: 1588321340608,
          // todo: ponder about the desired value in this case
          // Do we really want to keep the metavalue of a layer below,
          // if the value is not set?
          2: 1588321366606,
        },
      });
    });
  });

  it('pres', () => {
    const d = doc();
    const projection = proj(d, [['layer1', ['layer1_1']]]);
    expect(pres(projection)).toMatchObject([sym('+'), 11, 211]);
  });
});

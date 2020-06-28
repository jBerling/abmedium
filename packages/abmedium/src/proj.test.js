const { document, layer, seq, sym, num, str } = require('./core');
const proj = require('./proj');

const doc = () =>
  document({
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

describe('proj', () => {
  it('only base layer', () => {
    expect(proj(doc())).toEqual(
      layer({
        0: seq(1, 2, 3),
        1: sym('+'),
        2: num(1),
        3: num(2),
      })
    );
  });

  it('one layer', () => {
    const projection = proj(doc(), ['layer2']);
    expect(projection).toEqual(
      layer({
        0: [1, 2, 3],
        1: sym('+'),
        2: num(12),
        3: num(2),
      })
    );
  });

  it('two sibling layers', () => {
    const d = doc();
    const projection = proj(d, ['layer1', 'layer2']);
    expect(projection).toEqual(
      layer({
        0: [1, 2, 3],
        1: sym('+'),
        2: num(12),
        3: num(21),
      })
    );

    const projection2 = proj(d, ['layer2', 'layer1']);
    expect(projection2).toEqual(
      layer({
        0: [1, 2, 3],
        1: sym('+'),
        2: num(11),
        3: num(21),
      })
    );
  });

  it('layer with sublayers', () => {
    const projection = proj(doc(), [['layer1', ['layer1_1']]]);
    expect(projection).toEqual(
      layer({
        0: [1, 2, 3],
        1: sym('+'),
        2: num(11),
        3: num(211),
      })
    );
  });

  it('root replacement', () => {
    const d = document({ 0: str('a'), replacement: layer({ 0: str('b') }) });

    expect(proj(d, ['replacement'])).toEqual(
      layer({
        [0]: str('b'),
      })
    );
  });

  it('metalayers', () => {
    const d = document({
      0: seq(1, 2),
      1: str('a'),
      2: str('b'),
      descr: layer({ 1: str('small a'), 2: str('small b') }),
      ts: layer({ 1: num(1588321340608), 2: num(1588321366606) }),
      alt: layer({
        2: str('B'),
        descr: layer({ 2: str('big b') }),
      }),
    });

    const result = proj(d, ['alt'], ['descr', 'ts']);

    expect(result).toEqual(
      layer({
        0: seq(1, 2),
        1: str('a'),
        2: str('B'),
        descr: layer({
          1: str('small a'),
          2: str('big b'),
        }),
        ts: layer({
          1: num(1588321340608),
          // TODO: ponder about the desired value in this case
          // Do we really want to keep the metavalue of a layer below,
          // if the value is not set?
          2: num(1588321366606),
        }),
      })
    );
  });
});

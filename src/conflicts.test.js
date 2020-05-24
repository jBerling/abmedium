const { document } = require('./document');
const { proj, mapping, disagreement, root, sym } = require('./core');

describe('disagreements', () => {
  it('mapping', () => {
    const x = document('x');
    x.add(root, 'a');
    x.add(['layer1', root], 'b', 'a');

    expect(x.value()).toMatchObject({
      [root]: 'a',
      layer1: {
        [root]: mapping('a', 'b'),
      },
    });
  });

  // Todo: I leave them here as a reminder.
  // They might be useful if you want to override
  // a conflict in a layer you project upon.
  xit('mapping of disagreement', () => {});

  it('disagreement of unexpected atom', () => {
    const x = document('x');
    x.add(root, 'a');
    x.add(['layer1', root], 'b', 'c');

    expect(proj(x, ['layer1'])).toMatchObject({
      [root]: disagreement('c', 'a', 'b'),
    });
  });

  it('sequence agreement', () => {
    const x = document('x');
    x.add(root, [1, 2, 3]);
    x.add(['layer1', root], [3, 2, 1], [1, 2, 3]);

    expect(proj(x, ['layer1'])).toMatchObject({ [root]: [3, 2, 1] });
  });

  it('sequence disagreement', () => {
    const x = document('x');
    x.add(root, [1, 2, 3]);
    x.add(['layer1', root], [3, 2, 1], [1, 3, 2]);

    expect(proj(x, ['layer1'])).toMatchObject({
      [root]: disagreement([1, 3, 2], [1, 2, 3], [3, 2, 1]),
    });
  });

  it('symbol agreement', () => {
    const x = document('x');
    x.add(root, sym('a'));
    x.add(['layer1', root], sym('b'), sym('a'));

    expect(proj(x, ['layer1'])).toMatchObject({ [root]: sym('b') });
  });

  it('symbol disagreement', () => {
    const x = document('x');
    x.add(root, sym('a'));
    x.add(['layer1', root], sym('b'), sym('c'));

    expect(proj(x, ['layer1'])).toMatchObject({
      [root]: disagreement(sym('c'), sym('a'), sym('b')),
    });
  });
});

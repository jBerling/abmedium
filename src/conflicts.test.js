const { proj, mapping, disagreement, document, root } = require('./core');

describe('conflicts', () => {
  it('simultaneity', () => {
    const x = document('x');
    x.add(root, 'x-root');
    x.sync(document('y').add(root, 'y-root'));
    x.sync(document('z').add(root, 'z-root'));

    expect(x.value()).toMatchObject({
      [root]: new Set(['x-root', 'y-root', 'z-root']),
    });
  });

  it('mapping (find other name, replacer?)', () => {
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

  it('disagreement', () => {
    const x = document('x');
    x.add(root, 'a');
    x.add(['layer1', root], 'b', 'c');

    expect(proj(x, ['layer1'])).toMatchObject({
      [root]: disagreement('c', 'a', 'b'),
    });
  });
});

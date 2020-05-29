const { root } = require('@abrovink/abmedium');
const { document } = require('./document');

describe('Simultaneities', () => {
  // TODO not applicable since no causality info
  it('simultaneity', () => {
    const x = document('x');
    x.add(root, 'x-root');
    x.sync(document('y').add(root, 'y-root'));
    x.sync(document('z').add(root, 'z-root'));

    expect(x.value()).toMatchObject({
      [root]: new Set(['x-root', 'y-root', 'z-root']),
    });
  });

  // Todo: I leave them here as a reminder.
  // They might be useful if you want to override
  // a conflict in a layer you project upon.
  xit('mapping of simultaneity', () => {});
});

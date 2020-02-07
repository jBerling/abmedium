const { document, root, sym } = require('./core');
const { serialized } = require('./serialization');

describe('serialized', () => {
  const doc = () => {
    const d = document('a');
    d.add(root, ['a', 'b', 3, 4]);
    d.add('a', sym('atoms'));
    d.add('b', true);
    d.add(3, 'a string');
    d.add(4, 100);
    return d;
  };
  it('sequences and atoms', () => {
    expect(JSON.parse(serialized(doc().value()))).toMatchObject({
      0: ['a', 'b', 3, 4],
      a: { __SYM__: 'atoms' },
      b: true,
      3: 'a string',
      4: 100,
    });
  });

  it('simultaneity', () => {
    const d = doc();
    d.add(4, 101);
    d.sync(document('b').add(4, 102));

    console.log(serialized(d.value()));
  });
});

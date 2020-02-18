const { document, root, sym, proj, pres } = require('./core');
const { serialized, deserialized } = require('./serialization');

describe('serialized', () => {
  it('serializes and deserializes a document', () => {
    const d = document('test-document');
    d.add(root, ['handle-a']);
    d.add('handle-a', sym('atoms'));

    expect(pres(proj(deserialized(serialized(d))))).toMatchObject([
      sym('atoms'),
    ]);
  });

  it('serializes and deserializes a document with sumultanities', () => {
    const d = document();
    d.add(root, 'first');
    const serD = serialized(d);
    const delta = serialized(document().add(root, 'second'));

    const d2 = deserialized(serD);
    d2.sync(deserialized(delta));

    expect(pres(proj(d2))).toMatchObject(new Set(['first', 'second']));
  });

  it('deserializes a delta and applies it to a document', () => {
    const d = document('test-document');
    const deltas = [];
    deltas.push(serialized(d.add(root, ['handle-a'])));
    deltas.push(serialized(d.add('handle-a', sym('atoms'))));
    const d2 = document();
    d2.sync(deserialized(deltas[0]));
    d2.sync(deserialized(deltas[1]));
    expect(pres(proj(d2))).toMatchObject([sym('atoms')]);
  });
});

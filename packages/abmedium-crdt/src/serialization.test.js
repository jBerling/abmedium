const { pres, root, sym, proj, str, sim, seq } = require('@abrovink/abmedium');
const { document } = require('./document');
const { serialized, deserialized } = require('./serialization');

xdescribe('serialized', () => {
  it('serializes and deserializes a document', () => {
    const d = document('test-document');
    d.add(root, ['handle-a']);
    d.add('handle-a', sym('atoms'));

    expect(pres(proj(deserialized(serialized(d))))).toMatchObject([
      sym('atoms'),
    ]);
  });

  it('serializes and deserializes a document with simultanities', () => {
    const d = document('test-document');
    d.add(root, str('first'));
    const serD = serialized(d);
    const delta = serialized(
      document('test-document2').add(root, str('second'))
    );

    const d2 = deserialized(serD);
    d2.sync(deserialized(delta));

    expect(pres(proj(d2))).toMatchObject(sim([str('first'), str('second')]));
  });

  it('deserializes a delta and applies it to a document', () => {
    const d = document('test-document1');
    const deltas = [];
    deltas.push(serialized(d.add(root, seq('handle-a'))));
    deltas.push(serialized(d.add('handle-a', sym('atoms'))));
    const d2 = document('test-document2');
    d2.sync(deserialized(deltas[0]));
    d2.sync(deserialized(deltas[1]));
    expect(pres(proj(d2))).toMatchObject(seq(sym('atoms')));
  });
});
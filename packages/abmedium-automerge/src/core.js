const automerge = require('automerge');
const abmedium = require('@abrovink/abmedium');

const { valtype } = abmedium;

const vtype = abmedium.valtype.vtype;
valtype.vtype = v => (v instanceof automerge.Text ? 'txt' : vtype(v));

module.exports = {
  ...automerge,
  ...abmedium,

  txt: str => new automerge.Text(str),

  valtype,

  lengthOf: v =>
    valtype(v, 'txt') ? v.toString().length : abmedium.lengthOf(v),

  isEqual: (a, b) => {
    if (valtype(a, 'txt')) {
      if (!valtype(b, 'txt')) return false;
      return a.toString() === b.toString();
    }
    return abmedium.isEqual(a, b);
  },

  document: content =>
    content ? automerge.from(abmedium.document(content)) : automerge.init(),

  merge: (a, b) => {
    const merged = automerge.merge(a, b);
    return automerge.change(merged, doc => {
      for (const { handle, value } of abmedium.nodes(merged)) {
        const conflict = automerge.getConflicts(merged, handle);
        if (conflict) {
          doc[handle] = abmedium.sim(value, ...Object.values(conflict));
        }
      }
    });
  },
};

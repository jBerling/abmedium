const {
  document,
  layer,
  valtype,
  mapping,
  proj,
  treeOf,
} = require('@abrovink/abmedium');

let doc = document({
  0: 'ananas',
});

doc = {
  ...doc,
  en: layer({
    bertrand: layer({ 0: mapping('pineapple', 'ananas') }),
    john: layer({ 0: mapping('ananas', 'ananas') }),
    luigi: layer({ 0: mapping('pineapple', 'ananas') }),
  }),
};

// this will result in a disagreement, since the john layer expects
// to change from "ananas" to "ananas", but the bertrand layer
// has changed it to pineapple.
console.log('1.', proj(doc, [['en', ['bertrand', 'john']]]));
// 1. {
//   '0': ['dis', { expected: 'ananas', actual: 'pineapple', to: 'ananas' }],
// }

// this works with causing any disagreement
console.log('2.', proj(doc, [['en', ['john', 'bertrand']]]));
// 2. { '0': 'pineapple', __layer__: true }

// and this too
console.log('3.', proj(doc, [['en', ['bertrand']]]));
// 3. { '0': 'pineapple', __layer__: true }

// and this as well.
console.log('4.', proj(doc, [['en', ['bertrand', 'luigi']]]));
// 4. { '0': 'pineapple', __layer__: true }

const projection = proj(doc, [['en', ['bertrand', 'john']]]);

// A disagreement is a value, just like other values.
// Therefore you can render them using treeOf, for example.
console.log(
  '5.',
  treeOf(projection, val =>
    valtype(val, {
      dis: ([, { to, actual, expected }]) => ({
        to,
        actual,
        expected,
      }),
      _: () => val,
    })
  )
);
// 5. { to: 'ananas', actual: 'pineapple', expected: 'ananas' }

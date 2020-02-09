const { isSym, isSim } = require('./core');

const serialized = doc => {
  const reviver = (_, value) => {
    if (isSim(value)) {
      return { __SIM__: Array.from(value) };
    }
    if (isSym(value)) {
      return { __SYM__: value.name };
    }
    return value;
  };

  return JSON.stringify(doc, reviver);
};

const deserialized = (/*string*/) => {
  throw new Error('Not implemented');
};

module.exports = { serialized, deserialized };

/**
 * {
 *   "___directives___": {"symbol": "#sym", "simultaneity": "#s!", "disagreement": "#d!"}
 *
 *
 *
 *
 * }
 *
 *
 *
 *
 */

/*
simultaneity
['#s!', 'value1', 'value2', 'value3']
=> new Set(["value1", "value2", "value3"])
*/

/*
disagreement
['#d!', 'expected', 'actual', 'value']
=> new Disagreement("expected", "actual", "value")
*/

/*
Layer
=> object[LAYER]=true
*/

/*
sym
['#sym', 'symbol-content']
=> new String("symbol-content")[SYMBOL]=true
*/

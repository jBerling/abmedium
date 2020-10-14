// const get = (o, prop) => o && o[prop];
// const getIn = (o, path) => path.reduce(get, o);
// const has = (o, prop) => !!(o && o[prop]);
// const hasIn = (o, prop) => !!getIn(o, prop);

// const set = (o, prop, value) => ({ ...o, [prop]: value });
export const setIn = (o = {}, [prop, ...path]: (string | number)[], value) => ({
  ...o,
  [prop]: !path.length ? value : setIn(o[prop], path, value),
});

/**
 * As setIn but mutating object instead of returning a new one.
 *
 * @param o
 * @param param1
 * @param value
 */
export const mSetIn = (
  o: Object,
  [prop, ...path]: (string | number)[],
  value
) => {
  o[prop] = !path.length ? value : mSetIn(o[prop] || {}, path, value);
  return o;
};

// const mUpdateIn = (o = req('o'), path, fn = req('fn')) => {
//   if (!path.length) {
//     throw new Error('Empty path');
//   }
//   const v = getIn(o, path);
//   mSetIn(o, path, fn(v));
//   return o;
// };

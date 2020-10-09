// TODO remove
export const metaPrefix = "m$";

// TODO remove
export const reservedPrefix = "r$";

// TODO remove
export const trackedLabel = reservedPrefix + "tracked";

// TODO remove
export const disagreementLabel = metaPrefix + "dis";

export const disName = "dis";

export const simName = "sim";

export const symName = "sym";

export const numName = "num";

export const seqName = "seq";

export const strName = "str";

export const nilName = "nil";

export const refName = "ref";

export const scalarTypeNames: [
  typeof nilName,
  typeof strName,
  typeof numName,
  typeof symName,
  typeof refName
] = [nilName, strName, numName, symName, refName];

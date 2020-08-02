export const metaPrefix = "m$";

export const reservedPrefix = "r$";

export const trackedLabel = reservedPrefix + "tracked";

export const disagreementLabel = metaPrefix + "dis";

export const disName = "dis";

export const docName = "doc";

export const simName = "sim";

export const symName = "sym";

export const numName = "num";

export const seqName = "seq";

export const strName = "str";

export const nilName = "nil";

export const scalarTypeNames: [
  typeof nilName,
  typeof strName,
  typeof numName,
  typeof symName
] = [nilName, strName, numName, symName];

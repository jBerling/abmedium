import sha256 from "crypto-js/sha256";
import { enc } from "crypto-js";
import { Observable, of, throwError, forkJoin, combineLatest } from "rxjs";
import { Argv } from "yargs";
import { map, mergeMap, mergeAll, catchError } from "rxjs/operators";
import {
  proj,
  ViewStack,
  Label,
  Layer,
  asLayer,
  asRef,
  asNum,
  NodeValue,
  str,
  trackedLabel,
} from "@abrovink/abmedium";
import { fileHandler as defaultFileHandler } from "../util/file-handler";
import { FileHandler } from "../util/types";
import {
  mainDir,
  objectsDir,
  timestampsLayer,
  counter,
  head,
  viewStack,
} from "../constants";
import { addIn } from "../util/add-in";

export const command = "alt <id>";

export const describe = "add an alt value";

export const builder = (yargs): Argv<{ id: string }> => {
  return yargs.positional("id", {
    describe: "the entity ID",
  });
};

// Todo: move to @abrovink/abmedium?
export const layerStacking = (
  stack: ViewStack,
  path: Label[] = [],
  stacking: Label[][] = []
): Label[][] => {
  for (const item of stack) {
    if (!item) continue;
    else if (typeof item === "string" || typeof item === "number") {
      stacking.push([...path, item]);
    } else {
      const [layerName, children] = item;
      stacking.push([...path, layerName]);
      layerStacking(children, [...path, layerName], stacking);
    }
  }
  return stacking;
};

// Warning: this has the unorthodox behavior of creating layers
// if they don't exist.
export const layerByPath = (layer: Layer, path: Label[]): Layer | undefined => {
  let ret = layer;

  for (const label of path) {
    const layer = asLayer(ret[label]);
    if (layer) {
      ret = layer;
    } else {
      const newLayer: Layer = {};
      ret[label] = newLayer;
      ret = newLayer;
    }
  }

  return ret;
};

const alt = ({
  fileHandler: { resolve, readFile, writeFile, glob } = defaultFileHandler,
  hasher = ({ fileName, data }) =>
    sha256(fileName + ":::" + data).toString(enc.Hex) +
    "." +
    fileName.split(".").slice(-1),
  now = () => new Date().toISOString(),
  archiveName,
  id,
}: {
  fileHandler?: FileHandler;
  hasher?: (options: { fileName: string; data: string }) => string;
  now?: () => string;
  archiveName: string;
  id: string;
}): Observable<void> => {
  const archivePath = resolve(archiveName);
  const mainDirPath = resolve(archivePath, mainDir);
  const objectsDirPath = resolve(mainDirPath, objectsDir);
  const idFileName = resolve(mainDirPath, id);

  return combineLatest(
    readFile(resolve(mainDirPath, viewStack), "utf8").pipe(
      map((data): ViewStack => JSON.parse(data))
    ),
    readFile(idFileName, "utf8").pipe(map((data) => JSON.parse(data))),
    glob(resolve(archiveName, id + ".*")).pipe(
      mergeAll(),
      mergeMap((fileName) =>
        forkJoin({ fileName: of(fileName), data: readFile(fileName, "utf8") })
      ),
      mergeMap(({ fileName, data }) => {
        const hashedName = hasher({ fileName, data });
        return forkJoin({
          hashedName: of(hashedName),
          _: writeFile(resolve(objectsDirPath, hashedName), data, "utf8"),
        });
      })
    )
  ).pipe(
    mergeMap(([stack, doc, { hashedName: altValue }]) => {
      const [altPath, ...rest] = layerStacking(stack).reverse();

      if (!altPath) throw new Error("alt can not be used on the base layer");

      const projection = proj(doc, stack);

      let {
        nodes: { [head]: h },
      } = projection;

      const currentHead = asRef(h);
      if (!currentHead) throw new Error("not a ref");
      let sourceValue = projection.nodes[currentHead[1]];

      for (const sourcePath of [...rest, []]) {
        const sourceLayer = layerByPath(doc, sourcePath);

        if (!sourceLayer) continue;
        sourceValue = sourceLayer[currentHead[1]] as NodeValue;
        if (sourceValue !== undefined) break;
      }

      let c = asNum(doc[counter]);

      doc[counter] = c;

      if (layerByPath(doc, altPath) !== undefined) {
        console.warn("handle!");
      }

      addIn(doc, [...altPath, currentHead[1]], altValue);
      addIn(doc, [...altPath, timestampsLayer, currentHead[1]], str(now()));
      addIn(doc, [...altPath, trackedLabel, currentHead[1]], sourceValue);
      addIn(doc, [...altPath, head], currentHead);
      addIn(doc, [...altPath, trackedLabel, head], currentHead);

      return writeFile(idFileName, JSON.stringify(doc, null, 4), "utf8");
    }),
    catchError((err) => {
      console.error(err);
      return throwError(err);
    })
  );
};

export const handler = async ({ id }) =>
  new Promise((resolve) =>
    alt({ archiveName: process.cwd(), id }).subscribe(resolve)
  );

export default alt;

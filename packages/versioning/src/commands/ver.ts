import sha256 from "crypto-js/sha256";
import { enc } from "crypto-js";
import { Observable, of, throwError, forkJoin, combineLatest } from "rxjs";
import { Argv } from "yargs";
import { map, mergeMap, mergeAll, catchError } from "rxjs/operators";
import { ref, proj, str, num, ViewStack, Layer } from "@abrovink/abmedium";
import { fileHandler as defaultFileHandler } from "../util/file-handler";
import { FileHandler } from "../util/types";
import {
  mainDir,
  objectsDir,
  timestampsLayer,
  prev,
  counter,
  head,
  viewStack,
} from "../constants";
import { addIn } from "../util/add-in";

export const command = "ver <id>";

export const describe = "add the current value to the version history";

export const builder = (yargs): Argv<{ id: string; all: boolean }> => {
  return yargs
    .options({
      all: {
        alias: "a",
        description:
          "add all unstored values to the version histories (NOT IMPLEMENTED, JUST A PLACEHOLDER)",
      },
    })
    .positional("id", {
      describe: "the entity ID",
    });
};

const last = (a: Array<any>) => a[a.length - 1];

// TODO move to @abrovink/abmedium?
const activeLayer = (stack: ViewStack, parentLayer: Layer): Layer => {
  const item = last(stack);
  if (!item) return parentLayer;

  if (typeof item === "string" || typeof item === "number") {
    if (!parentLayer[item]) parentLayer[item] = {};
    return parentLayer[item] as Layer;
  }

  const [layerName, children] = item;
  parentLayer[layerName] = parentLayer[layerName] || {};
  return activeLayer(children, parentLayer[layerName] as Layer);
};

const ver = ({
  fileHandler: { resolve, readFile, writeFile, glob } = defaultFileHandler,
  hasher = ({ fileName, data }) =>
    sha256(fileName + ":::" + data).toString(enc.Hex) +
    "." +
    last(fileName.split(".")),
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
    mergeMap(([stack, doc, { hashedName }]) => {
      const projected = proj(doc, stack);
      const {
        nodes: { [counter]: currentCounter, [head]: previous },
      } = projected;

      let c = currentCounter as number;
      let versionLabel = c++;

      doc[counter] = num(c);

      const layer = activeLayer(stack, doc);
      layer[versionLabel] = hashedName;

      if (previous) addIn(layer, [prev, versionLabel], previous);

      layer[head] = ref(versionLabel);

      addIn(layer, [timestampsLayer, versionLabel], str(now()));

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
    ver({ archiveName: process.cwd(), id }).subscribe(resolve)
  );

export default ver;

import { Observable, of, forkJoin, combineLatest, throwError } from "rxjs";
import { map, catchError, mergeMap } from "rxjs/operators";
import { proj, valtype } from "@abrovink/abmedium";
import defaultFileHandler from "../util/file-handler";
import { FileHandler } from "../util/types";
import {
  mainDir,
  objectsDir,
  timestampsLayer,
  head,
  viewStack,
} from "../constants";

export const command = "proj";

export const describe = "project layers";

// TODO move these
type LayerName = string;
type LayerWithSublayers = [LayerName, ViewStack];
type ViewStack = (LayerName | LayerWithSublayers)[];

const last = (a: Array<any>): any => a[a.length - 1];

const valueObjectName = (doc): string => {
  const name = doc[doc[doc[head]][1][1]];

  if (!name) {
    throw new Error("No value object name could be found");
  }

  return name;
};

const fileEnding = (fileName: string): string =>
  "." + last(fileName.split("."));

const projCommand = ({
  fileHandler: { resolve, readFile, writeFile, readDir } = defaultFileHandler,
  archiveName,
}: {
  fileHandler?: FileHandler;
  archiveName: string;
}): Observable<void> => {
  const archivePath = resolve(archiveName);
  const mainDirPath = resolve(archivePath, mainDir);
  const objectsDirPath = resolve(mainDirPath, objectsDir);

  return combineLatest(
    readFile(resolve(mainDirPath, viewStack), "utf8").pipe(
      map((data): ViewStack => JSON.parse(data))
    ),
    readDir(mainDirPath).pipe(
      mergeMap((files) =>
        files
          .filter((name) => !name.startsWith("."))
          .map((name) => resolve(mainDirPath, name))
      ),
      mergeMap((fileName) => {
        return forkJoin({
          id: of(last(fileName.split("/"))),
          rawDoc: readFile(fileName, "utf8").pipe(
            map((data) => JSON.parse(data))
          ),
        });
      })
    )
  ).pipe(
    mergeMap(([stack, { id, rawDoc }]) => {
      const projected = proj(rawDoc, stack, [timestampsLayer]);
      return forkJoin(
        valtype(valueObjectName(projected), {
          str: (objectName) => ({
            fileName: of(resolve(archivePath, id + fileEnding(objectName))),
            data: readFile(resolve(objectsDirPath, objectName), "utf8"),
          }),
          dis: ([, { expected, actual, to: objectName }]) => ({
            expected: readFile(resolve(objectsDirPath, expected), "utf8"),
            actual: readFile(resolve(objectsDirPath, actual), "utf8"),
            fileName: of(resolve(archivePath, id + fileEnding(objectName))),
            data: readFile(resolve(objectsDirPath, objectName), "utf8"),
          }),
        })
      );
    }),
    mergeMap(({ fileName, data, expected, actual }: any) => {
      console.log({ fileName, data, expected, actual });
      return writeFile(fileName, data, "utf8");
    }),
    catchError((err, catched) => {
      console.error(err, catched);
      return throwError(err);
    })
  );
};

export const handler = async () =>
  new Promise((resolve) => {
    projCommand({ archiveName: process.cwd() }).subscribe(resolve);
  });

export default projCommand;

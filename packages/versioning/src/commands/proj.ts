import { Observable, of, forkJoin, combineLatest, throwError } from "rxjs";
import { map, catchError, mergeMap } from "rxjs/operators";
import {
  proj,
  ViewStack,
  node,
  asRef,
  asStr,
  Str,
  Dis,
} from "@abrovink/abmedium";
import { fileHandler as defaultFileHandler } from "../util/file-handler";
import { FileHandler } from "../util/types";
import { mainDir, objectsDir, head, viewStack } from "../constants";

export const command = "proj";

export const describe = "project layers";

const last = (a: Array<any>): any => a[a.length - 1];

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
      const projection = proj(rawDoc, stack);

      console.log("pong!", projection);

      const headRef = asRef(projection.nodes[head]);
      if (!headRef) throw new Error("not handled");
      const currentNode = node(projection, headRef);
      if (!currentNode) throw new Error("not handled");
      const { value, disagreement } = currentNode;
      const objectFileName = value as Str;

      if (!disagreement) {
        return forkJoin({
          fileName: of(resolve(archivePath, id + fileEnding(objectFileName))),
          data: readFile(resolve(objectsDirPath, objectFileName), "utf8"),
        });
      } else {
        const [
          ,
          { actual: _actual, expected: _expected },
        ] = disagreement as Dis;
        const actualFileName = asStr(_actual);
        const expectedFileName = asStr(_expected);

        let actual, expected;

        if (actualFileName) {
          actual = readFile(resolve(objectsDirPath, actualFileName), "utf8");
        }

        if (expectedFileName) {
          expected = readFile(
            resolve(objectsDirPath, expectedFileName),
            "utf8"
          );
        }

        return forkJoin({
          expected,
          actual,
          fileName: of(resolve(archivePath, id + fileEnding(objectFileName))),
          data: readFile(resolve(objectsDirPath, objectFileName), "utf8"),
        });
      }
    }),
    mergeMap(({ fileName, data /* expected, actual */ }: any) => {
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

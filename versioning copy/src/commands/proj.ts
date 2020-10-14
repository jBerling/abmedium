import { Observable, of, forkJoin, combineLatest, throwError } from "rxjs";
import { map, catchError, mergeMap } from "rxjs/operators";
import {
  proj,
  ViewStack,
  node,
  asRef,
  asStr,
  Ref,
  Str,
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
      const headNode = node(projection, head);
      if (!headNode) throw new Error("No head");
      const headRef = asRef(headNode.value);
      if (!headRef) throw new Error("head is not a Ref");
      const objectFileName = asStr(node(projection, headRef)?.value);
      if (!objectFileName) throw new Error("No current objectFileName");

      const actualHeadRef = asRef(
        headNode.disagreement && headNode.disagreement[1].actual
      );

      if (!actualHeadRef) {
        return forkJoin({
          actual: of(undefined),
          expected: of(undefined),
          fileName: of(resolve(archivePath, id + fileEnding(objectFileName))),
          data: readFile(resolve(objectsDirPath, objectFileName), "utf8"),
        });
      } else {
        // const [
        //   ,
        //   { actual: _actual, expected: _expected },
        // ] = disagreement as Dis;
        // const actualFileName = asStr(_actual);
        // const expectedFileName = asStr(_expected);
        // let actual, expected;
        // if (actualFileName) {
        //   actual = readFile(resolve(objectsDirPath, actualFileName), "utf8");
        // }
        // if (expectedFileName) {
        //   expected = readFile(
        //     resolve(objectsDirPath, expectedFileName),
        //     "utf8"
        //   );
        // }

        // TODO simplified for now
        const trackedLayer = rawDoc;
        const objectName = ([, label]: Ref): Str => trackedLayer[label];

        return forkJoin({
          expected: readFile(
            resolve(objectsDirPath, objectName(headRef)),
            "utf8"
          ),
          actual: readFile(
            resolve(objectsDirPath, objectName(actualHeadRef)),
            "utf8"
          ),
          fileName: of(resolve(archivePath, id + fileEnding(objectFileName))),
          data: readFile(resolve(objectsDirPath, objectFileName), "utf8"),
        });
      }
    }),
    mergeMap(({ fileName, data, expected, actual }) => {
      if (expected || actual) {
        console.log(`
expected 
========
${expected}
        
actual
======
${actual}
`);
      }
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

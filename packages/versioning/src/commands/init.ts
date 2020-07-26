import { Observable, forkJoin, throwError } from "rxjs";
import { mergeMapTo, catchError } from "rxjs/operators";
import defaultFileHandler from "../util/file-handler";
import { FileHandler } from "../util/types";
import { mainDir, objectsDir, viewStack } from "../constants";

export const command = "init";

export const describe = "initialize a new archive";

// export const builder = () => {};

const init = ({
  fileHandler: { ensureDir, resolve, writeFile } = defaultFileHandler,
  archiveName,
}: {
  fileHandler?: FileHandler;
  archiveName: string;
}): Observable<void> => {
  const mainDirPath = resolve(archiveName, mainDir);
  const objectsDirPath = resolve(mainDirPath, objectsDir);

  return forkJoin([ensureDir(mainDirPath), ensureDir(objectsDirPath)]).pipe(
    mergeMapTo(writeFile(resolve(mainDirPath, viewStack), "[]", "utf8")),
    catchError((err, catched) => {
      console.error(err, catched);
      return throwError(err);
    })
  );
};

export const handler = async () =>
  new Promise((resolve) => {
    init({ archiveName: process.cwd() }).subscribe(resolve);
  });

export default init;

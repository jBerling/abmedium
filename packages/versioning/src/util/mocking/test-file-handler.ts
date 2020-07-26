import { Observable } from "rxjs";
import { FileHandler } from "../types";
import fromCallback from "../../util/from-callback-operator";
import { Minimatch } from "minimatch";

type Directory<T> = Record<string, string | T>;
export type TestFiles = Directory<Directory<Directory<string>>>;

const pathSegments = (path: string): string[] =>
  path.split("/").filter((p) => p);

const get = (directory: any, [head, ...rest]: string[]) => {
  if (!head) throw new Error("head was undefined");
  if (!rest || !rest.length) return directory[head];
  return get(directory[head], rest);
};

const warnAboutFilePath = (path: string) => {
  if (path.startsWith("/")) {
    console.warn("Actual file path used?", path);
  }
};

const getFile = (files: TestFiles, path: string) => {
  warnAboutFilePath(path);
  const res = get(files, pathSegments(path));
  if (!res || typeof res !== "string") {
    throw new Error("No file named " + path);
  }
  return { filename: path, data: res };
};

const getDir = (files: TestFiles, path: string) => {
  warnAboutFilePath(path);

  const res = path ? get(files, pathSegments(path)) : files;

  if (!res || typeof res !== "object") {
    throw new Error("No directory named " + path);
  }
  return res;
};

const createDir = (files: TestFiles, path: string) => {
  warnAboutFilePath(path);

  const segments = pathSegments(path);
  const parent = getDir(
    files,
    segments.slice(0, segments.length - 1).join("/")
  );

  parent[segments[segments.length - 1]] = {};
};

const createFile = (files, path: string, data: string): void => {
  warnAboutFilePath(path);

  const segments = pathSegments(path);
  const parent = getDir(
    files,
    segments.slice(0, segments.length - 1).join("/")
  );

  parent[segments[segments.length - 1]] = data;
};

const exists = (files: TestFiles, path: string): boolean => {
  warnAboutFilePath(path);

  try {
    const res = get(
      files,
      path.split("/").filter((p) => p)
    );
    return !!res;
  } catch (err) {
    return false;
  }
};

const filenames = (files: TestFiles): string[] => {
  const names: string[] = [];

  const walk = (dir: TestFiles, parentPath: string): void => {
    for (const key of Object.keys(dir)) {
      const data = dir[key];
      const path = parentPath ? parentPath + "/" + key : key;
      if (typeof data === "string") {
        names.push(path);
      } else if (typeof data === "object") {
        walk(data, path);
      }
    }
  };

  walk(files, "");

  return names;
};

export const testFileHandler = (files: TestFiles): FileHandler => ({
  resolve: (...pathSegments: string[]): string =>
    pathSegments.filter((s) => s).join("/"),

  readFile: (fileName) =>
    new Observable((subscriber) => {
      try {
        subscriber.next(getFile(files, fileName).data);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),
  writeFile: (fileName, data) =>
    new Observable((subscriber) => {
      try {
        createFile(files, fileName, data);
        subscriber.next();
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),
  unlink: (fileName: string) =>
    new Observable((subscriber) => {
      try {
        const segments = pathSegments(fileName);
        const dirPath = segments.slice(0, segments.length - 1).join("/");
        const dir = getDir(files, dirPath);
        if (dir) dir[segments[segments.length - 1]] = undefined;
        subscriber.next();
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),
  readDir: (dirName) =>
    new Observable((subscriber) => {
      try {
        subscriber.next(Object.keys(getDir(files, dirName)));
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),
  ensureDir: (dirName) =>
    new Observable((subscriber) => {
      try {
        if (!exists(files, dirName)) createDir(files, dirName);
        subscriber.next();
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),
  glob: (pattern, options = {}) =>
    new Observable((subscriber) => {
      try {
        const mm = new Minimatch(pattern, options);
        subscriber.next(filenames(files).filter((fname) => mm.match(fname)));
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    }),

  pipable: {
    readFile: () =>
      fromCallback((filename, next, errorHandler) => {
        try {
          next(getFile(files, filename).data);
        } catch (err) {
          console.error(err);
          errorHandler(err);
        }
      }),

    writeFile: () =>
      fromCallback(([fileName, data], next, errorHandler) => {
        try {
          createFile(files, fileName, data);
          next();
        } catch (err) {
          console.error(err);
          errorHandler(err);
        }
      }),

    unlink: () =>
      fromCallback((fileName, next, errorHandler) => {
        try {
          const segments = pathSegments(fileName);
          const dirPath = segments.slice(0, segments.length - 1).join("/");
          const dir = getDir(files, dirPath);
          if (dir) dir[segments[segments.length - 1]] = undefined;
          next();
        } catch (err) {
          console.error(err);
          errorHandler(err);
        }
      }),

    readDir: () =>
      fromCallback((dirname, next, errorHandler) => {
        try {
          next(Object.keys(getDir(files, dirname)));
        } catch (err) {
          console.error(err);
          errorHandler(err);
        }
      }),

    ensureDir: () =>
      fromCallback((dirName, next, errorHandler) => {
        try {
          if (!exists(files, dirName)) createDir(files, dirName);
          next();
        } catch (err) {
          console.error(err);
          errorHandler(err);
        }
      }),

    glob: (options = {}) =>
      fromCallback((pattern: string, next, errorHandler) => {
        const mm = new Minimatch(pattern, options);
        try {
          next(filenames(files).filter((fname) => mm.match(fname)));
        } catch (err) {
          errorHandler(err);
        }
      }),
  },
});

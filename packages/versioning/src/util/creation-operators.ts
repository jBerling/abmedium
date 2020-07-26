import fs from "fs";
import glob_ from "glob";
import { Observable } from "rxjs";

export const readFile = (
  fileName: string,
  encoding: "utf8"
): Observable<string> =>
  new Observable((subscriber) => {
    try {
      fs.readFile(fileName, encoding, (err, data) => {
        if (err) subscriber.error(err);
        else {
          subscriber.next(data);
          subscriber.complete();
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  });

export const writeFile = (
  fileName: string,
  data: string,
  encoding: "utf8"
): Observable<void> =>
  new Observable((subscriber) => {
    try {
      fs.writeFile(fileName, data, encoding, (err) => {
        if (err) subscriber.error(err);
        else {
          subscriber.next();
          subscriber.complete();
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  });

export const unlink = (fileName: string): Observable<void> =>
  new Observable((subscriber) => {
    try {
      fs.unlink(fileName, (err) => {
        if (err) subscriber.error(err);
        else {
          subscriber.next();
          subscriber.complete();
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  });

export const readDir = (dirName: string): Observable<string[]> =>
  new Observable((subscriber) => {
    try {
      fs.readdir(dirName, (err, files) => {
        if (err) subscriber.error(err);
        else {
          subscriber.next(files);
          subscriber.complete();
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  });

export const ensureDir = (dirName: string) =>
  new Observable((subscriber) => {
    try {
      if (fs.existsSync(dirName)) {
        subscriber.next(dirName);
        subscriber.complete();
      } else {
        fs.mkdir(dirName, (err) => {
          if (err) subscriber.error(err);
          else {
            subscriber.next(dirName);
            subscriber.complete();
          }
        });
      }
    } catch (err) {
      subscriber.error(err);
    }
  });

export const glob = (pattern): Observable<string[]> =>
  new Observable((subscriber) => {
    try {
      glob_(pattern, {}, (err, matches) => {
        if (err) subscriber.error(err);
        else {
          subscriber.next(matches);
          subscriber.complete();
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  });

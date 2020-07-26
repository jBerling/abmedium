import fs from "fs";
import glob_ from "glob";
import fromCallback from "./from-callback-operator";

export const readFile = (encoding: "utf8") =>
  fromCallback<string, string>((fileName, next, errorHandler) => {
    fs.readFile(fileName, encoding, (err, data) => {
      if (err) errorHandler(err);
      else next(data);
    });
  });

export const writeFile = (encoding: "utf8") =>
  fromCallback<[string, string], void>(
    ([fileName, data], next, errorHandler) => {
      fs.writeFile(fileName, data, encoding, (err) => {
        if (err) errorHandler(err);
        else next();
      });
    }
  );

export const unlink = () =>
  fromCallback<string, void>((filename, next) => {
    fs.unlink(filename, () => next());
  });

export const readDir = () =>
  fromCallback<string, string[]>((filename, next, errorHandler) => {
    fs.readdir(filename, (err, files) => {
      if (err) errorHandler(err);
      else next(files);
    });
  });

export const ensureDir = () =>
  fromCallback<string, void>((dirname, next, errorHandler) => {
    try {
      if (fs.existsSync(dirname)) {
        next();
      } else {
        fs.mkdir(dirname, (err) => {
          if (err) errorHandler(err);
          else next();
        });
      }
    } catch (err) {
      errorHandler(err);
    }
  });

export const glob = () =>
  fromCallback<string, string[]>((filePattern, next, errorHandler) => {
    try {
      glob_(filePattern, {}, (err, matches) => {
        if (err) errorHandler(err);
        else next(matches);
      });
    } catch (err) {
      errorHandler(err);
    }
  });

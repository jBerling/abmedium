import {
  readFile as pipeReadFile,
  writeFile as pipeWriteFile,
  unlink as pipeUnlink,
  readDir as pipeReadDir,
  ensureDir as pipeEnsureDir,
  glob as pipeGlob,
} from "./pipable-operators";

import {
  readFile,
  writeFile,
  unlink,
  readDir,
  ensureDir,
  glob,
} from "./creation-operators";
import { resolve } from "path";
import { FileHandler } from "./types";

export const fileHandler: FileHandler = {
  resolve,

  readFile,
  writeFile,
  unlink,
  readDir,
  ensureDir,
  glob,

  pipable: {
    readFile: pipeReadFile,
    writeFile: pipeWriteFile,
    unlink: pipeUnlink,
    readDir: pipeReadDir,
    ensureDir: pipeEnsureDir,
    glob: pipeGlob,
  },
};

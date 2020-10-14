import { resolve } from "path";

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

export type FileHandler = {
  resolve: typeof resolve;

  readFile: typeof readFile;
  writeFile: typeof writeFile;
  unlink: typeof unlink;
  readDir: typeof readDir;
  ensureDir: typeof ensureDir;
  glob: typeof glob;

  pipable: {
    readFile: typeof pipeReadFile;
    writeFile: typeof pipeWriteFile;
    unlink: typeof pipeUnlink;
    readDir: typeof pipeReadDir;
    ensureDir: typeof pipeEnsureDir;
    glob: typeof pipeGlob;
  };
};

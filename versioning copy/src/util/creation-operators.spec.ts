import { resolve } from "path";
import fs from "fs";
import {
  readFile,
  writeFile,
  unlink,
  readDir,
  ensureDir,
  glob,
} from "./creation-operators";

describe("File Creation Operators", () => {
  const subdirName = resolve(__dirname, "test-dir/sub-dir");
  const temporaryFilename = resolve(__dirname, "test-dir/temporary.txt");
  const temporaryFilename2 = resolve(__dirname, "test-dir/temporary2.txt");

  afterEach(() => {
    if (fs.existsSync(subdirName)) {
      fs.rmdirSync(subdirName);
    }

    if (fs.existsSync(temporaryFilename)) {
      fs.unlinkSync(temporaryFilename);
    }

    if (!fs.existsSync(temporaryFilename2)) {
      fs.writeFileSync(temporaryFilename2, "Test file", "utf8");
    }
  });

  test("readFile", (ok) => {
    readFile(resolve(__dirname, "test-dir", "foo.txt"), "utf8").subscribe(
      (res) => {
        expect(res).toEqual("karamba!\n");
        ok();
      }
    );
  });

  test("writeFile", (ok) => {
    writeFile(temporaryFilename, "I am temporary.\n", "utf8").subscribe(() => {
      if (!fs.existsSync(temporaryFilename)) {
        throw new Error("No file created");
      }

      ok();
    });
  });

  test("unlink", (ok) => {
    unlink(temporaryFilename2).subscribe(() => {
      if (fs.existsSync(temporaryFilename2)) {
        throw new Error("File not unlinked");
      }
      ok();
    });
  });

  test("readDir", (ok) => {
    readDir(resolve(__dirname, "test-dir")).subscribe((files) => {
      expect(files).toEqual([
        "foo.txt",
        "humle.html",
        "humle.md",
        "temporary2.txt",
      ]);
      ok();
    });
  });

  test("ensureDir", (ok) => {
    ensureDir(subdirName).subscribe((res) => {
      expect(res).toBe(subdirName);
      expect(fs.existsSync(subdirName)).toBe(true);
      ok();
    });
  });

  test("glob", (ok) => {
    glob(resolve(__dirname, "test-dir/humle.*")).subscribe(
      (res: string[]): void => {
        expect(res).toEqual([
          resolve(__dirname, "test-dir/humle.html"),
          resolve(__dirname, "test-dir/humle.md"),
        ]);
        ok();
      }
    );
  });
});

import { of } from "rxjs";
import { catchError } from "rxjs/operators";
import { resolve } from "path";
import fs from "fs";
import {
  readFile,
  writeFile,
  unlink,
  readDir,
  ensureDir,
  glob,
} from "./pipable-operators";

describe("Pipable File Operators", () => {
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
    of(resolve(__dirname, "test-dir", "foo.txt"))
      .pipe(readFile("utf8"))
      .subscribe((res) => {
        expect(res).toEqual("karamba!\n");
        ok();
      });
  });

  test("readFile (error)", (ok) => {
    of(resolve(__dirname, "test-dir", "foox.txt"))
      .pipe(
        readFile("utf8"),
        catchError(() => of("failed"))
      )
      .subscribe((data) => {
        expect(data).toEqual("failed");
        ok();
      });
  });

  test("writeFile", (ok) => {
    of<[string, string]>([temporaryFilename, "I am temporary.\n"])
      .pipe(writeFile("utf8"))
      .subscribe(() => {
        if (!fs.existsSync(temporaryFilename)) {
          throw new Error("No file created");
        }

        ok();
      });
  });

  test("unlink", (ok) => {
    of(temporaryFilename2)
      .pipe(unlink())
      .subscribe(() => {
        if (fs.existsSync(temporaryFilename2)) {
          throw new Error("File not unlinked");
        }
        ok();
      });
  });

  test("readDir", (ok) => {
    of(resolve(__dirname, "test-dir"))
      .pipe(readDir())
      .subscribe((files) => {
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
    of(subdirName)
      .pipe(ensureDir())
      .subscribe((res) => {
        expect(res).toBe(undefined);
        expect(fs.existsSync(subdirName)).toBe(true);
        ok();
      });
  });

  test("glob", (ok) => {
    of(resolve(__dirname, "test-dir/humle.*"))
      .pipe(glob())
      .subscribe((res): void => {
        expect(res).toEqual([
          resolve(__dirname, "test-dir/humle.html"),
          resolve(__dirname, "test-dir/humle.md"),
        ]);
        ok();
      });
  });
});

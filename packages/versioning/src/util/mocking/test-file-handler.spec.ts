import { of } from "rxjs";
import { publish } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../types";
import { testFileHandler, TestFiles } from "./test-file-handler";

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(JSON.parse(JSON.stringify(actual))).toEqual(
      JSON.parse(JSON.stringify(expected))
    );
  });

const run = (fn) => () => testScheduler().run(fn);

describe("test file handler", () => {
  let fileHandler: FileHandler;
  let files: TestFiles;

  beforeEach(() => {
    files = {
      sub: {
        subsub: {},
        "humle.txt": "Success!\n",
        "dumle.html": "\n",
      },
      "foo.txt": "\n",
      "bar.md": "\n",
    };
    fileHandler = testFileHandler(files);
  });

  test("resolve", () => {
    const { resolve } = fileHandler;
    expect(resolve("dumle", "humle.txt")).toEqual("dumle/humle.txt");
  });

  describe("creation operators", () => {
    test(
      "readFile",
      run(({ expectObservable }) => {
        const { resolve, readFile } = fileHandler;

        expectObservable(readFile(resolve("sub/humle.txt"), "utf8")).toBe(
          "(a|)",
          {
            a: "Success!\n",
          }
        );
      })
    );

    test(
      "writeFile",
      run(({ expectObservable, flush }) => {
        const { resolve, writeFile } = fileHandler;

        expectObservable(
          writeFile(resolve("sub/temporary.txt"), "I am temporary.\n", "utf8")
        ).toBe("(a|)", { a: undefined });

        flush();

        expect(files).toMatchObject({
          sub: { "temporary.txt": "I am temporary.\n" },
        });
      })
    );

    test(
      "unlink",
      run(({ expectObservable, flush }) => {
        const { resolve, unlink } = fileHandler;

        expectObservable(unlink(resolve("sub/humle.txt"))).toBe("(a|)", {
          a: undefined,
        });

        flush();

        expect(files).toEqual({
          sub: {
            subsub: {},
            "dumle.html": "\n",
          },
          "foo.txt": "\n",
          "bar.md": "\n",
        });
      })
    );

    test(
      "readDir",
      run(({ expectObservable }) => {
        const { resolve, readDir } = fileHandler;

        expectObservable(readDir(resolve("sub"))).toBe("(a|)", {
          a: ["subsub", "humle.txt", "dumle.html"],
        });
      })
    );

    test(
      "ensureDir",
      run(({ expectObservable, flush }) => {
        const { resolve, ensureDir } = fileHandler;

        expectObservable(ensureDir(resolve("sub/subsub2"))).toBe("(a|)", {
          a: undefined,
        });

        flush();

        expect(files).toMatchObject({ sub: { subsub2: {} } });
      })
    );

    test(
      "glob",
      run(({ expectObservable }) => {
        const { resolve, glob } = fileHandler;

        expectObservable(glob(resolve("sub/*umle.*"))).toBe("(a|)", {
          a: ["sub/humle.txt", "sub/dumle.html"],
        });
      })
    );
  });

  describe("pipable operators", () => {
    test(
      "readFile",
      run(({ expectObservable }) => {
        const {
          pipable: { readFile },
        } = fileHandler;

        expectObservable(of("sub/humle.txt").pipe(readFile("utf8"))).toBe(
          "(a|)",
          {
            a: "Success!\n",
          }
        );
      })
    );

    test(
      "writeFile",
      run(({ expectObservable, flush }) => {
        const {
          resolve,
          pipable: { writeFile },
        } = fileHandler;

        expectObservable(
          of<[string, string]>([
            resolve("sub/temporary.txt"),
            "I am temporary.\n",
          ]).pipe(writeFile("utf8"))
        ).toBe("(a|)", { a: "I am temporary.\n" });

        flush();

        expect(files).toMatchObject({
          sub: { "temporary.txt": "I am temporary.\n" },
        });
      })
    );

    test(
      "unlink",
      run(({ flush }) => {
        const {
          pipable: { unlink },
        } = fileHandler;

        (of("sub/humle.txt", "foo.txt").pipe(
          unlink(),
          publish()
        ) as any).connect();

        flush();

        expect(files).toEqual({
          sub: {
            subsub: {},
            "dumle.html": "\n",
          },
          "bar.md": "\n",
        });
      })
    );

    test(
      "readDir",
      run(({ expectObservable }) => {
        const {
          pipable: { readDir },
        } = fileHandler;

        expectObservable(of("sub").pipe(readDir())).toBe("(a|)", {
          a: ["subsub", "humle.txt", "dumle.html"],
        });
      })
    );

    test(
      "ensureDir",
      run(({ expectObservable, flush }) => {
        const {
          resolve,
          pipable: { ensureDir },
        } = fileHandler;

        expectObservable(
          of(resolve("sub/subsub2")).pipe(ensureDir())
        ).toBe("(a|)", { a: undefined });

        flush();

        expect(files).toMatchObject({ sub: { subsub2: {} } });
      })
    );

    test(
      "glob",
      run(({ expectObservable }) => {
        const {
          resolve,
          pipable: { glob },
        } = fileHandler;

        expectObservable(of(resolve("sub/*umle.*")).pipe(glob())).toBe("(a|)", {
          a: ["sub/humle.txt", "sub/dumle.html"],
        });
      })
    );
  });
});

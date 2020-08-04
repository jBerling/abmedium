import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../util/types";
import { testFileHandler, TestFiles } from "../util/mocking/test-file-handler";
import add from "./add";
import { num } from "@abrovink/abmedium";
import { mainDir, objectsDir, counter } from "../constants";

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(JSON.parse(JSON.stringify(actual))).toEqual(
      JSON.parse(JSON.stringify(expected))
    );
  });

const run = (fn) => () => testScheduler().run(fn);

describe("abv-add", () => {
  let fileHandler: FileHandler;
  let archive: TestFiles;

  beforeEach(() => {
    archive = {
      [mainDir]: {
        [objectsDir]: {},
      },
      "foo.md": "# Foo\n",
    };
    fileHandler = testFileHandler(archive);
  });

  test(
    "add",
    run(({ expectObservable, flush }) => {
      expectObservable(
        add({
          fileHandler,
          archiveName: "",
          id: "foo",
        })
      ).toBe("(a|)", { a: undefined });

      flush();

      expect(archive).toEqual({
        [mainDir]: {
          [objectsDir]: {},
          foo: JSON.stringify(
            {
              [counter]: num(0),
            },
            null,
            4
          ),
        },
        "foo.md": "# Foo\n",
      });
    })
  );
});

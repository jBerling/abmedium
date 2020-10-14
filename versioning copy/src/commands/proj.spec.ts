import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../util/types";
import { testFileHandler, TestFiles } from "../util/mocking/test-file-handler";
import proj from "./proj";
import { ref, str, nil, trackedLabel } from "@abrovink/abmedium";
import { mainDir, objectsDir, head, viewStack, prev } from "../constants";

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(JSON.parse(JSON.stringify(actual))).toEqual(
      JSON.parse(JSON.stringify(expected))
    );
  });

const run = (fn) => () => testScheduler().run(fn);

describe("abv-proj", () => {
  let fileHandler: FileHandler;
  let archive: TestFiles;

  beforeEach(() => {
    archive = {
      [mainDir]: {
        [viewStack]: "[]",
        [objectsDir]: {
          "foo-en-1.md": "# Foo\n\nThe example.\n",
          "foo-en-2.md": "# Foo\n\nAn example.\n",
          "foo-se-1.md": "# Foo\n\nEtt exempel.\n",
        },
        foo: JSON.stringify(
          {
            [head]: ref(1),
            [prev]: { 0: nil, 1: ref(0) },
            0: str("foo-en-1.md"),
            1: str("foo-en-2.md"),
            se: {
              1: str("foo-se-1.md"),
              [trackedLabel]: { 1: str("foo-en-2.md"), [head]: ref(1) },
            },
          },
          null,
          4
        ),
      },
    };
    fileHandler = testFileHandler(archive);
  });

  test(
    "projects base layer",
    run(({ expectObservable, flush }) => {
      expectObservable(proj({ fileHandler, archiveName: "" })).toBe("(a|)", {
        a: undefined,
      });

      flush();

      expect(archive["foo.md"]).toEqual("# Foo\n\nAn example.\n");
    })
  );

  test(
    "projects layer",
    run(({ expectObservable, flush }) => {
      archive[mainDir][viewStack] = `["se"]`;

      expectObservable(proj({ fileHandler, archiveName: "" })).toBe("(a|)", {
        a: undefined,
      });

      flush();

      expect(archive["foo.md"]).toEqual("# Foo\n\nEtt exempel.\n");
    })
  );

  xtest(
    "projects disagreement",
    run((/*{ expectObservable, flush }*/) => {
      throw "not implemented";
    })
  );
});

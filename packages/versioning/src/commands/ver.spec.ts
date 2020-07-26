import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../util/types";
import { testFileHandler, TestFiles } from "../util/mocking/test-file-handler";
import ver from "./ver";
import { abDocument, num, seq, nil } from "@abrovink/abmedium";
import { mainDir, objectsDir, counter, viewStack, head } from "../constants";

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(JSON.parse(JSON.stringify(actual))).toEqual(
      JSON.parse(JSON.stringify(expected))
    );
  });

const run = (fn) => () => testScheduler().run(fn);

const hasher = ({ fileName }: { fileName: string; data: string }): string =>
  `<${fileName.split(".")[0]}>.${fileName.split(".")[1]}`;

const now = () => "2020-07-20T18:36Z";

describe("abv ver", () => {
  let fileHandler: FileHandler;
  let archive: TestFiles;

  beforeEach(() => {
    archive = {
      [mainDir]: {
        [viewStack]: "[]",
        [objectsDir]: {},
        foo: JSON.stringify(
          abDocument({
            [counter]: num(0),
          }),
          null,
          4
        ),
      },
      "foo.md": "# Foo\n",
    };
    fileHandler = testFileHandler(archive);
  });

  test(
    "adds first version",
    run(({ expectObservable, flush }) => {
      expectObservable(
        ver({
          fileHandler,
          hasher,
          now,
          archiveName: "",
          id: "foo",
        })
      ).toBe("(a|)", { a: undefined });

      flush();

      expect(archive).toMatchSnapshot();
    })
  );

  test(
    "adds second version",
    run(({ expectObservable, flush }) => {
      // @ts-ignore
      archive[mainDir].foo = JSON.stringify(
        abDocument({
          [counter]: num(2),
          0: seq(nil, 1),
          1: "ver1.md",
          [head]: num(0),
        }),
        null,
        4
      );

      expectObservable(
        ver({
          fileHandler,
          hasher,
          now,
          archiveName: "",
          id: "foo",
        })
      ).toBe("(a|)", { a: undefined });

      flush();

      expect(archive).toMatchSnapshot();
    })
  );

  // test(
  //   "adds the first version ",
  //   run(({ expectObservable, flush }) => {
  //     archive[mainDir][viewStack] = '[["a", ["b", "c"]]]';

  //     expectObservable(
  //       ver({
  //         fileHandler,
  //         hasher,
  //         now,
  //         archiveName: "",
  //         id: "foo",
  //       })
  //     ).toBe("(a|)", { a: undefined });

  //     flush();

  //     expect(archive).toMatchSnapshot();
  //   })
  // );
});

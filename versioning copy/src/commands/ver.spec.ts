import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../util/types";
import { testFileHandler, TestFiles } from "../util/mocking/test-file-handler";
import ver from "./ver";
import { ref, num } from "@abrovink/abmedium";
import {
  mainDir,
  objectsDir,
  counter,
  viewStack,
  head,
  prev,
  timestampsLayer,
} from "../constants";

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
          {
            [counter]: num(0),
          },
          null,
          4
        ),
      },
      "foo.md": "# Foo\n",
    };
    fileHandler = testFileHandler(archive);
  });

  test(
    "adds the first version",
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
    "adds the second version",
    run(({ expectObservable, flush }) => {
      // @ts-ignore
      archive[mainDir].foo = JSON.stringify(
        {
          [counter]: num(1),
          0: "ver1.md",
          [head]: ref(0),
          [timestampsLayer]: {},
          [prev]: {},
        },
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
});

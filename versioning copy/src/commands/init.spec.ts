import { TestScheduler } from "rxjs/testing";
import { FileHandler } from "../util/types";
import { testFileHandler, TestFiles } from "../util/mocking/test-file-handler";
import init from "./init";
import { mainDir, objectsDir, viewStack } from "../constants";

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(JSON.parse(JSON.stringify(actual))).toEqual(
      JSON.parse(JSON.stringify(expected))
    );
  });

const run = (fn) => () => testScheduler().run(fn);

describe("init", () => {
  let fileHandler: FileHandler;
  let archive: TestFiles;

  beforeEach(() => {
    archive = {};
    fileHandler = testFileHandler(archive);
  });

  it(
    "initializes a new abv archive",
    run(({ expectObservable, flush }) => {
      expectObservable(init({ fileHandler, archiveName: "" })).toBe("(a|)", {
        a: undefined,
      });

      flush();

      expect(archive).toEqual({
        [mainDir]: { [objectsDir]: {}, [viewStack]: "[]" },
      });
    })
  );
});

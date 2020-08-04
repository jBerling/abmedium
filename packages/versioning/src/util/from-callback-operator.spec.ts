import { from, of } from "rxjs";
import { toArray, catchError } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { fromCallback } from "./from-callback-operator";

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

const testRun = (description: string, fn) => {
  test(description, () => {
    testScheduler.run(fn);
  });
};

describe("fromCallback operator", () => {
  it("can be tested the old-school way", () => {
    from(["humle", "dumle"])
      .pipe(
        fromCallback<string, string>((v, next) => next(v.toUpperCase())),
        toArray()
      )
      .subscribe((result) => {
        expect(result).toEqual(["HUMLE", "DUMLE"]);
      });
  });

  it("can be tested the old-school way asynchronously", (ok) => {
    from(["humle", "dumle"])
      .pipe(
        fromCallback<string, string>((v, next) => {
          setTimeout(() => {
            next(v.toUpperCase());
          }, 10);
        }),
        toArray()
      )
      .subscribe((result) => {
        expect(result).toEqual(["HUMLE", "DUMLE"]);
        ok();
      });
  });

  testRun("can be tested using marble-tests", ({ expectObservable }) => {
    const $ = from(["foo", "bar"]).pipe(
      fromCallback<string, string>((v, next) => {
        next(v.toUpperCase());
      }),
      toArray()
    );
    expectObservable($).toBe("(a|)", { a: ["FOO", "BAR"] });
  });

  it("handles errors", (ok) => {
    from(["humle", "dumle"])
      .pipe(
        fromCallback<string, string>((value, next, error) => {
          if (value === "dumle") {
            error("Oh, no!");
          }
          next(value);
        }),
        catchError((err) => {
          return of(err);
        }),
        toArray()
      )
      .subscribe((result) => {
        expect(result).toEqual(["humle", "Oh, no!"]);
        ok();
      });
  });
});

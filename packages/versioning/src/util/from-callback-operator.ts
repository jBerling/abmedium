import { Observable, Observer } from "rxjs";

type Next<Out> = (out: Out) => void;

type Callback<In, Out> = (
  sourceValue: In,
  next: Next<Out>,
  errorHandler: (err: Error | string) => void
) => void;

export default <T, R>(cb: Callback<T, R>) => (source: Observable<T>) =>
  new Observable((observer: Observer<R>) => {
    let items = 0;
    let completed = 0;
    let complete = () => {};

    const subscription = source.subscribe({
      next(x: T) {
        items += 1;
        cb(
          x,
          (out) => {
            observer.next(out);
            completed += 1;
            complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        complete = () => {
          if (items === completed) observer.complete();
        };
        complete();
      },
    });

    return function teardown() {
      subscription.unsubscribe();
    };
  });

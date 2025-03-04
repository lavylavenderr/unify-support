export type MiddlewareFn<T extends (...any: any) => void> = (
  next: () => void,
  ...args: Parameters<T>
) => void;

export default function middlwareify<T extends (...any: any) => void>(
  fn: T,
  middlewareFns?: ((next: () => void, ...args: Parameters<T>) => void)[]
): (...args: Parameters<T>) => void {
  return middlewareFns
    ? async (...args: Parameters<T>) => {
        const next = async (index: number) => {
          if (index > middlewareFns.length - 1) fn(...args);
          else middlewareFns[index](async () => next(index + 1), ...args);
        };

        await next(0);
      }
    : fn;
}

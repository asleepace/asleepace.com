/**
 *  ### Pipe
 *
 *  A simple utility class to chain functions together.
 */
export class Pipe<T> {

  static data<T>(value: T): Pipe<T> {
    return new Pipe(value)
  }

  constructor(private value: T) {}

  pipe<G>(fn: (value: T) => G): Pipe<G> {
    return Pipe.data(fn(this.value))
  }

  unwrap(): T | never {
    if (this.value === undefined || this.value === null) {
      throw new Error('Value is null or undefined')
    }
    return this.value
  }

  debug(label: string): Pipe<T> {
    console.log(label, this.value)
    return this
  }
}

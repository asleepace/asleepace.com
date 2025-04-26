---
title: 'Typescript - Errors as Values'
description: 'Simple and powerful error handling which leverages errors as values, result tuples and try/catch utility methods.'
pubDate: 'April 26 2025'
heroImage: '/images/abstract-tree.png'
slug: 'try'
---

Error handling in software engineering is one of those things that's kind of like paying taxes, it's something we all have to do\* and nobody enjoys doing it...

If you are anything like me, then you are most likely familiar with how tedious and awkward error handling with try / catch statements can feel, especially in languages like Javascript and Typescript. Often times I find myself having to write unweildy code like the following:

```ts
function getUrlFromString(urlString: string): URL | undefined {
  let url: URL | undefined
  try {
    url = new URL(urlString)
  } catch (error) {
    console.warn(`invalid url: ${(error as Error)?.message}`)
    try {
      url = new URL(`https://${urlString}`)
    } catch (error2) {
      return undefined
    }
  }
  return url
}
```

And while this might seem like a trivial example and something that could easily be abstracted into smaller utility functions, it might surprise you that I've seen stuff like this in corporate production software.

What I do like about this example, it that it demonstrates several key issues with the try / catch pattern, especially relating to Typescript:

- values are scoped to their respective block
- errors are not guarenteed to be of type `Error`
- retries can becomes extremely verbose
- it isn't clear if a function throws

Along with this since any function can throw from somewhere deep in the call stack, the control flow of the program can become unpredictable and hard to reason about what is happening and where. In fact, let's take a look at one more example. What do you think this function will return?

```ts
function generateOddNumbers(count: number) {
  let oddNumbers: number[] = new Array(count).fill(0)

  try {
    // generate an array of random numbers
    oddNumbers = oddNumbers.map((_, i) => Math.floor(Math.random() * i))

    // check if they are all odd and return or throw
    if (oddNumbers.every((num) => num % 2 === 1)) {
      return oddNumbers
    } else {
      throw 'Invalid sequence'
    }
  } catch (e) {
    // handle errors
    console.warn(`Error generating numbers: ${e}`)
    return false
  } finally {
    // cleanup resource
    console.log('cleaning up resources...')
    oddNumbers = []
    return
  }
}
```

Perhaps you might guess that maybe for a low enough value of count, that it might return an array of only odd numbers once in a while. That would make send right?

Well if you guessed `undefined` for any number, you would be correct, just imagine the headache if we had multiple nested finally blocks...

## A better way?

While the above examples may seem a but contrived, they highlight some key issues with try/catch based error handling. If you are familiar with other programming languages like Go or Rust, then you are probably already know where I am going with this –– \*errors as **values\***.

Instead of throwing errors willy-nilly to whoever will catch them, the idea is to treat them as first class citizens and handle as close to the call site as possible. While this article isn't a deep dive into the errors as values paradigm, a lot of the techniques have been inspired by Rust.

Now let's start coding a re-usable solution which can help simplify our error handling process. Since this will be in Typescript let's begin by describing the shape of our data which should either by a generic value `T` or the concrete `Error` class, but not both.

```ts
type ResultOk<T> = [T, undefined]
type ResultError = [undefined, Error]
type Result<T> = ResultOk<T> | ResultError
```

The above types are just tuples with either contain the value `T | undefined` in the first position and `undefined | Error` in the second position. The last type represents the union between these two values and will help us with type narrowing later. Next we will create a simple utility to convert our try/catch based errors into result tuples:

```ts
function tryCatch<T>(fn: () => T | never): Result<T> {
  try {
    const value = fn()
    return [value, undefined] as ResultOk<T>
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    return [undefined, error] as ResultError
  }
}
```

The `tryCatch(fn)` utility takes a function to be invoked and wraps it inside a try/catch statement. If the function throws then the exception will be caught and converted to an error if needed, otherwise it will return the value. Since each branch returns a type which is narrower than the `Result<T>` the result tuple is easy to unpack and check for errors.

```ts
const [url, error] = tryCatch(() => new URL(maybeUrl))

if (error) return console.warn(error.message)

return url.href // type-safe!
```

Since `error` will only be defined when `[undefined, Error]` and we early return if it is defined, the Typescript type system is able to infer that `url` must be defined below! Now let's revisit the same problem I mentioed in the begining of this article and see how this approach does.

```ts
function getUrlFromString(urlString: string): URL | undefined {
  let [url1, err1] = tryCatch(() => new URL(urlString))
  if (!err1) return url
  else console.warn(err1.message)

  let [url2, err2] = tryCatch(() => new URL(`https://${urlString}`))
  if (!err2) return url2
  else console.warn(err2.message)

  let [url3, err3] = tryCatch(() => new URL(`https://${urlString}`).trim())
  if (!err3) return url3
  else console.warn(err3.message)
}
```

Just like that our `getUrlFromString(urlString)` is far more succinct and easy to follow, so much so that we were able to add another case to make the program more robust! The less time we spend fiddling with nested try/catch statements, casting errors and wrangling control flow; the more time we can spend on making programs which crash less!

## Synchronous vs. Asynchronous

So far the `tryCatch` utility works great for synchronous error handling. However, most of the time errors tend to stem from asynchronous operations like `fetch()` requests and json decoding. Here is where we run into a little issue with the type system...

```ts
const result = tryCatch(async () => {
  return JSON.parse('[1, 2, 3]') as number[]
})

typeof result // Result<Promise<number[]>>
```

The problem here is that the promise is now inside our result and thus needs to be unpacked before we can call await. However, this also causes another issue as calling await on the result value can throw! Instead what we would like is for the return type to be `Promise<Result<number[]>>` like so:

```ts
const [data, error] = await tryCatch(async () => {
  return JSON.parse('[1, 2, 3]') as number[]
})

if (!error) {
  return data.map((num) => num * 10)
}
```

While we _could_ just create another utility like `tryCatchAsync(fn)` that fits these constraints, just look at that beautiful example above, that's what we **want** –– not that _"we have error values at home nonsense"_.

### Advanced Typees

Just like before, let's start by describing what it is we want with types. We roughly know what the async type should be from above, but how can we translate this to our example? Well the first thing to understand is that async/await is merely just syntactic sugar around promises.

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

Just like before, let's start by describing what it is we want with types. We roughly know what the async type should be from above, but how can we translate this to our example? Well the first thing to understand is that async/await is merely just syntactic sugar around promises\*.

```ts
function example1() {
  return new Promise<string>((resolve) => resolve('abc'))
}

async function example2() {
  return 'hello'
}

type PromiseType = typeof example1 // () => Promise<string>
type AsyncFnType = typeof example1 // () => Promise<string>
```

This means that _theoretically_ all we need to do is adjust our `tryCatch(fn)` to distinguish between `T` and `Promise<T>`. If we notice that the return type is a `Promise`, then we can assume the function should be considered async.

```ts
function tryCatch<T>(
  fn: () => Promise<T> | T | never
): Result<Promise<T>> | Result<T> {
  // ...
}
```

Unfortunately, this is where things start getting a bit complicated. If you hover over the result type now you will see the following:

```ts
const result = tryCatch(someFunc)
typeof result // ResultError | ResultOk<number[]> | ResultOk<Promise<number[]>>
```

The issue is the type system isn't able to narrow the type simply by placing an await statement in front of the try/catch. This means functions which should be only synchronous are now appearing as potentially promises and vis-versa...

We need to find a way to narrow the type system such that promises only are returned for async functions and not for synchronous ones, while async functions should only return promises and never synchronous results.

I tinkered with this problem for long than I would like to admit, making marginal gains in one area, only at the cost of regressing in others. For a time I even thought that the technology simply didn't exist yet, until one day I stumbled across the following snippet:

```ts
const markdownHtml = marked.render(markdown, { async: true })
```

A library that was able to return either sync or async simply by passing an optional argument to the method. This discovery re-ignited my unyielding thirst for a truly isomorphic try/catch helper and sent me into overdrive. Quickly I rushed to the packages Github source code and began trawling through the dense source code, until finally I noticed the secret.

## Function Overloading

Function overloading in Typescript is most likely one of those things that you probably never think about unless you are a library maintainer or deep in the weeds. It allows for defining muultiple variants of the same function or method which can take different arguments and return different values, and works by declaring just the function signature above the implementation.

For example imagine we have two similar functions which either add two numbers together or concat two strings. The implementation is nearly identical and it would be nice if we just had two write this logic once. The issue we want to avoid is allowing our new `add(a, b)` function to add a number and string or vis-versa.

```ts
function addString(x: string, y: string): string {
  return x + y
}

function addNumber(x: number, y: number): number {
  return x + y
}
```

This is where function overloading comes in handy, we can declare multiple versions of the same function which help narrow the return type when calling directly. The caveat is that the actual implementation must contain the most permissive type which can accomadate any of the values also passed to the overloads.

```ts
function add(x: number, y: number): number
function add(x: string, y: string): string
function add(x: number | string, y: number | string): number | string {
  if (typeof x === 'string' && typeof y === 'string') return x + y
  if (typeof x === 'number' && typeof y === 'number') return x + y
  throw new Error('Mismatched types!')
}

add(123, 456) // ok!
add('a', 'b') // ok!
add(123, 'b') // type-error
add('a', 456) // type-error
```

As you can see we had to jump through a lot of hoops to even get this simple example working, but I hope it illustrates how function overloading can be used to declare multiple type variants of the same function. The first two function definition are recognized by the type system as overloads, where the last definition handles the actual implementation.

Bringing this back to the `tryCatch(fn)` helper, let's see how we can leverage function overloads to help distinguish between the synchronous and asynchronous versions of our function.

```ts
function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>>
function tryCatch<T>(fn: () => T | never): Result<T>
function tryCatch<T>(
  fn: () => T | never | Promise<T>
): Result<T> | Promise<Result<T>> {
  // ...
}
```

The first function overload handles our async case where the `fn` passed as an argument returns a promise, this version should also return a promise which can be awaited to obtain the result tuple containing `T` or an `Error`. The second overload handles our synchronous case where the `fn` passed as an argument either returns `T` or `never` (can throw). Finally the last overload combines all three for our implementation.

Ok, this is starting to look fairly _promising_ if I do say so myself... all that is left now is to handle the implementation. The tricky part here is figuring out how to perform a runtime check for an async function and then how to apply our error catching logic to this async function in a synchronous context. Luckily, this is actually what promises are in the first place!

```ts
try {
  const output = fn()
  if (output instanceof Promise) {
    return output
      .then((value) => [value, undefined] as ResultOk<T>)
      .catch((error) => [undefined, error] as ResultError)
  }
  return [output, undefined] as ResultOk<T>
} catch (e) {
  const error = e instanceof Error ? e : new Error(String(e))
  return [undefined, error] as ResultError
}
```

The first step is execute the `fn()` passed as an argument and then check if the return value `output` is a promise. We can do this using the `instanceof` operator and if `true` we can call the `.then()` and `.catch()` to extract the value and construct our result tuple! This will then return our desired type `Promise<Result<T>>` which can be awaited!

We are almost there now, but as some of you might have already noticed, we haven't properly coerced the async `error` value into the `Error` class. Let's extract the logic we used below in the original version into a seperate helper which can be used by bother versions.

```ts
const toError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e))
```

It's not perfect, but it gets the job done for now. Basically just checks if the error value is already an instance of the `Error` class and if so does nothing, otherwise converts the value to a string which is then used to instantiate an `Error`. Now tying this altogether we should have something that looks like the following:

```ts
// our ressult types...
type ResultOk<T> = [T, undefined]
type ResultError = [undefined, Error]
type Result<T> = ResultOk<T> | ResultError

// our error handling utility...
const toError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e))

// our try/catch overloads and implementation...
function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>>
function tryCatch<T>(fn: () => T | never): Result<T>
function tryCatch<T>(
  fn: () => T | never | Promise<T>
): Result<T> | Promise<Result<T>> {
  try {
    const output = fn()
    if (output instanceof Promise) {
      return output
        .then((value) => [value, undefined] as ResultOk<T>)
        .catch((error) => [undefined, toError(error)] as ResultError)
    }
    return [output, undefined] as ResultOk<T>
  } catch (e) {
    return [undefined, toError(e)] as ResultError
  }
}
```

Now let's go ahead and test this implementation with a couple different variations to ensure our types are working properly and the code does what we expect it to do for both synchronous and asynchronous operations! Below I've added test cases for synchronous, asynchronous and promise based arguments. For each different variant I've included one that throws and one that returns successfully.

```ts
async function main() {
  const result0 = tryCatch(() => 123)
  const result1 = tryCatch(() => {
    if (Math.random() < 1.0) throw new Error('thrown sync')
    return 123
  })
  const result2 = await tryCatch(async () => 'abc')
  const result3 = await tryCatch(async () => {
    throw new Error('thrown async')
  })
  const result4 = await tryCatch(() => new Promise<boolean>((res) => res(true)))
  const result5 = await tryCatch(
    () => new Promise((_, reject) => reject('thrown promise'))
  )

  // output the all the results once finished...
  const outputs = [result0, result1, result2, result3, result4, result5]
  outputs.forEach((info, i) => console.log(`Test #${i}: `, info))
}
```

Looking at this code in a code editor shows that each of the results indeed have the desired return type, please note that some additional type casting needs to be done for the promises. Running this code also outputs what we expect as well:

```txt
[LOG] Test #0:  [123, undefined]
[LOG] Test #1:  [undefined, thrown sync]
[LOG] Test #2:  ["abc", undefined]
[LOG] Test #3:  [undefined, thrown async]
[LOG] Test #4:  [true, undefined]
[LOG] Test #5:  [undefined, thrown promise]
```

The result types are looking good and the implementation is working as expected! Lastly, let's try adding some edge-cases to make sure we haven't missed anything. Let's test the following:

1. What happens if `fn()` doesn't return or throw anything
2. What happens if `fn()` returns an `Error` instead of throwing
3. What happens if `fn()` never returns and only throws

```ts
const result6 = tryCatch(() => {})
const result7 = tryCatch(() => new Error('error as value'))
const result8 = tryCatch(() => {
  throw new Error('123')
})
```

The first two edge-cases appear to work as we might expect, the first one returns `Result<void>` and the second returns `Result<Error>`, which is reasonable as our function is only concerned with catching errors, but not if the value they return is an error _per se_. However, for `result8` we can see something funky...

```ts
const result8: Promise<Result<unknown>>
```

Oh no, what is happening here? Well since this function never returns a value, this signature for `fn` looks like the following `fn: () => never`, which can't easily be matched by our current function overloads. No worries, the fix is quite simple as we just need to add the following overload:

```ts
function tryCatch<T>(fn: () => never): ResultError
```

Since the function `never` returns, this means it must throw and thus we can specify the return type to always be the sync `ResultError`. Thankfully, we only need to add this for sync version as the async version will still always return a promise first.

Finally, after the all the things we've tried, we were able to catch a break and create the fabled _isomorphic_ try/catch utility. Well, at least that's what I call it anyways. Isomorphic in this context meaning:

> An isomorphic function, or isomorphism, is a bijection (one-to-one and onto mapping) between two sets or structures that preserves the relevant properties or operations of those structures. In simpler terms, it's a way of showing that two things are essentially the same, even if they look different, by establishing a perfect match between their elements while maintaining their underlying relationships.

Which I found as a fitting way to describe the relationship between the try/catch utility behaving the same in both synchronous and asynchronous contexts. What's even more fitting is that usually function overloading is meant for polymorphism...

Anyways, I hope you enjoyed this article and learned something along the way. The next step is expand on the actual result type, with special methods like `.unwrap()` and `or()`, but I will save that for the next article.

You can play around with a live example of the code here on the [Typescript playground](https://www.typescriptlang.org/play/?target=99#code/FAehAICUFMGcFcA2AXcA3Aho+0C00AnAgewN2XgAdFpxkBPSuYBpqOJZAeQGsAeACoA+cAF5wAbQEAacPAB2AE2gAzAJbzoigLotGtGAhQBRIqTGSFy9ZsWzTJArtYGOKQSPGHOvD+AA+7EbIDqTAoBChBOAAxsTyaISwavFyyGqIagzAcfKwqMjEURYAFNAAXHLyPPLEAO7yAJSVxaIitBr5GPIx0MQq4MUA-OC0lZp1g2YEJQDKyAQaAOZljY3hYOAAYgox6anEiQSIxBiKsOAAZOBqALbU0LfQ8sgY+-IAdF-AKrvvdAR6ABhN4xAAWHhKKnklRKjTEIk0R2aQU4UR+fxS8gBwNBEOEUJh4DhCPAAAUSLc1LBoB4URTiFSaXxvO5hEIMT1-gtcchwZDobD4W1wAIAuAkYQUazkB5OXssTiQXz8UJCULSWLApLooEGUzacJpW5ZcJxfrqbSZR4RABvYDgR048D2p1u2LxfLgYjwZCUX0WaFwh3ux1qAYlH1+gOdV49PoDC00+Gu0PugjQCgEbFR-3IENptMfZBg54lEqYbDQYUiCSVnCyKyqDRabTgDAXGW+I0Fwvuj4xPHlwiOGuWJTN2yyQpRMrTRptjuokzz3tugC+a6dGaz2Ikud9jYnNlb7c7Ju7HI3sSH1ZdW8dO-g2fH1hbdjoRWmq0X5+C6I3YBNwiUU4FQQcaVgcpgA7egenAX4uUVW4MA0ElU0dXJYGIGgBxoDAZnWN0sNQDNggABgsHllXBcsxwARgAJgAZiIp0SPAMjOHoqjARosE6NJDD3XDYkAFk3jBD4CG6RRGRJPhwHIj4AFZ4RLEhJgmKZHBKAByDT6mxWA4JiPS2NDJ8XyY5je3XCyPTyUiTUYiwMDqVCCj4odYPgkkRT0jAACMzIcjiuJQZi3I8rIlR8ky-LHYS3UMrToEmWcDLBTTsV80KH3Aeze3Ck0ABZos8uKVUEkVtKTWkguIHDoG6NUSjIscyJKBYcDWMLPWc4IVIq2LqKHAr-MRdLyUpS0+B1NqAH1ZAzAAraA9k66B1r2fTUuxShZppcyHP6pzOJNAA2XjeVoyaXSK4iBou4IAHYbv4mqpoy78ACIR3MJd62gX61mK56IuQAAOD6h3u5KnVSiVptnX6bNBuz1nB86D2QC5xAkSHyJWk16JJ4JGPJzhmKplBStp5AVIZy6Gdehmod0N1cdgD4VFIYwMDujQ+dkNQxyw5qPhOFYAAMBDA8AAGIABJbTUddKhl0X5D5sHgM2AAReIDIQ0glkzT8b0QRA6DBakAEJgBQtDGiAA) or view the full source code on my Github.

Thanks again for reading and if you have any questions, comments or suggestions feel free to reach out to me on X or Github, happy coding!

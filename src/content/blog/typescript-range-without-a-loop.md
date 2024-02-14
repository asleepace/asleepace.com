---
title: 'Implementing a range in TypeScript without a loop'
description: 'How to implement a range sequence using generators in TypeScript for fun!'
pubDate: 'Feb 13, 2024'
heroImage: '/blog-placeholder-2.jpg'
---

The other day I came across this question on LinkedIn which stated the following:

> 👌 A common coding question in Javascrip interview
Write a function that implements range WITHOUT using loop?

Unable to resist the urge to write some needlesly complex and over-engineered solution, I began weighing my options. Initially, my mind went to recursion. Then to recursion, then to recursion...

```ts
function range(a: number, b: number): number[] {
  return a < b ? [a, ...range(a + 1, b)] : [b]
}
```

[Try it on the TypeScript playground!](https://www.typescriptlang.org/play?module=1#code/GYVwdgxgLglg9mABAJwIZgOYFMAUqBciYIAtgEZbIA0iZhx5lAlPaRcgNoC6iA3gFCIUWKCGRJUiADy1EAfkQdUNAHRq0mXJIDUiAIw0yTHoQ5ku-AL79+AeluIsAD1QkADgBssiEAGdU2PwQCL5wXioecBg4Gtg4BvoADExMQA)

However, this was widely **boring** and **severly unambitios**; No, what I needed was something with a bit more *spice*...

## Generator Expiraments

Then it hit me! Let's use that thing I always want to use, but literally can never find a good enough reason. That's right, the goold 'ol Generator. It had been a while since I last touched these pointy starred wonders, and so I got to expiramenting to refresh my memory.

```ts
function* range() {
  yield 1
  yield 2
  yield 3
  yield 4
  yield 5
}

console.log(...range()) // [1, 2, 3, 4, 5]
```

Yup, still got it! However, then it dawned on me. Normally I use a loop inside a generator, so the solution would have to bring back our old friend recursion, recursion, recuriosn!

```ts
function* range(a: number, b: number) {
  if (a > b) return
  yield a
  yield* range(a + 1, b)
}
```

Hmmmmmm.... the code was working, but TypeScript wasn't pleased. A few prayers to the type God and a couple minutes later I had finished at last, and was eagerly awaiting to dunk on the LinkedIn n00bs!

```ts
type RangeIterator = Generator<number, void, undefined>

function* range(a: number, b: number): RangeIterator {
  if (a > b) return
  yield a
  yield* range(a + 1, b)
}

console.log(...range(1, 5)) // 1, 2, 3, 4, 5
```

[Try it on the TypeScript playground!](https://www.typescriptlang.org/play?module=1&ssl=10&ssc=29&pln=2&pc=1#code/FAFwngDgpgBASgQwHYHMoEkRQE4JAe2xgF4YBxKJHPQgHiQFcBbAIxwBoYA3fASwBNODJPygAzXlX4A+YMDHCAxiF74kAKhi5UUABQIAXDEasOMFkZNtsASiOIdmagSIBvYDBi8xMfTGnmNlpQIAzYSB4wYLxQADb8MAiR0XH8mtpougDUWQicLDbAAL5yimoAzvixUAB0sfgoujXNGXoAjJxtAAw2NkA)

## How it works?

While the above code may look foreign to the unsuspecting LinkedIn denizen, it actually isn't all that complicated. The key takeaway here is how we can abuse the `...` operator to spread them cheeks.

Let's take a look at the execution flow starting from `console.log(...range(1, 5))`

0. We call `range(1, 5)` which creates our generator
1. The `...` operator does the dirty work of iterating
2. The iterator will continue until `return` has been called
3. The first pass `a = 1` and `b = 5`
   - Since `a > b` is `false` we continue
   - Next we `yield a` which is `1` to the output
   - Next we `yield*` which returns another generator
4. The second pass `a = 2` and `b = 5`
   - Since `a > b` is `false` we continue
   - Next we `yield a` which is `2` to the output
   - Next we `yield*` which returns another generator
4. This continues until `a > b` and `return`
5. This tells the iterator we are done!
6. Leaving us with `1, 2, 3, 4, 5`

Or an even more simplified way to think about this

- `yield` appends a value to an iterator
- `yield*` appends values from an iterator to another iterator
- `return` tells the iterator we are done

## Final thoughts

While this code would most certainly be rejected on any production pull request, it was a fun example of leveraging some seldom used parts TypeScript which are quite cool, and this is just the surface!

The way I like to think about generators is that they are functions with state, which can pause execution and even have values passed back-in from the caller. They are used quite heavily in libraries like `react-redux` and also have support for `async` via the `AsyncGenerator`. You can learn more about them here or feel free to ask me any questions!

Happy coding!

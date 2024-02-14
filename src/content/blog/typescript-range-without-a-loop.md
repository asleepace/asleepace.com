---
title: 'Implementing a range in TypeScript without loops*'
description: 'How to implement a range sequence using generators in TypeScript for fun!'
pubDate: 'Feb 13, 2024'
heroImage: '/generator-cover.png'
---

The other day I was browsing **LinkedIn** and came across the following [post](https://www.linkedin.com/feed/update/urn:li:activity:7163364024087220224?utm_source=share&utm_medium=member_desktop)

> 👌 A common coding question in Javascript interview: Write a function that implements range WITHOUT using loop?

Unable to resist the urge to write some needlessly complex and over-engineered code, I began weighing my options. Initially, my mind went to recursion. Then to recursion, then to recursion...

```ts
function range(a: number, b: number): number[] {
  return a < b ? [a, ...range(a + 1, b)] : [b]
}
```

[Try it on the TypeScript playground!](https://www.typescriptlang.org/play?module=1#code/GYVwdgxgLglg9mABAJwIZgOYFMAUqBciYIAtgEZbIA0iZhx5lAlPaRcgNoC6iA3gFCIUWKCGRJUiADy1EAfkQdUNAHRq0mXJIDUiAIw0yTHoQ5ku-AL79+AeluIsAD1QkADgBssiEAGdU2PwQCL5wXioecBg4Gtg4BvoADExMQA)

However, this was widely **boring** and **severely unambitious**; No, what I needed was something with a bit more *spice*...

## Generator Experiments

Then it hit me! Let's use that thing I always want to use, but literally can never find a good enough reason. That's right, the good 'ol **[Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)**.

> The Generator object is returned by a generator function and it conforms to both the iterable protocol and the iterator protocol.
> Generator is a subclass of the hidden Iterator class. [Source](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)

It had been a while since I last touched these pointy starred wonders, and so I got to experimenting to refresh my memory.

```ts
function* range() {
  yield 1
  yield 2
  yield 3
  yield 4
  yield 5
}

console.log(...range()) // 1, 2, 3, 4, 5
```

Yup, still got it 😉! But, then it dawned on me... normally I use a loop inside a generator, so the solution would have to bring back our old friend recursion, recursion, recursion!

```ts
function* range(a: number, b: number) {
  if (a > b) return
  yield a
  yield* range(a + 1, b)
}
```

Hmmm.... the code was working, but TypeScript wasn't pleased. A few prayers to the **TypeGod's** and a couple <strike>minutes</strike> hours later I had finished at last, and was eagerly awaiting to dunk on the **LinkedIn** n00bs!

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

While the above code may look foreign to the unsuspecting LinkedIn denizen, it actually isn't all that complicated. The key takeaway here is how we can abuse the spread `...` operator to *spread* them cheeks.

Let's take a look at the execution flow starting from `console.log(...range(1, 5))`

0. We call `range(1, 5)` which creates our iterator
1. The `...` operator does the dirty work of iterating
2. The iterator will continue until `return` has been called
3. The first pass `a = 1` and `b = 5`
   - Since `a > b` is `false` we continue
   - Next we `yield a` which is `1` to the output
   - Next we `yield*` which returns another generator (step #4)
4. The second pass `a = 2` and `b = 5`
   - Since `a > b` is `false` we continue
   - Next we `yield a` which is `2` to the output
   - Next we `yield*` which returns another generator ()
5. This continues until `a > b` and `return`
6. This tells the iterator we are done!
7. Leaving us with `1, 2, 3, 4, 5`

Or an even more simplified way to think about this

- `yield` pauses / resumes the iterator and returns a value to the caller
- `yield*` delegate to another iterable object, such as a Generator.
- `return` tells the iterator we are done

## Final thoughts

While this code would most certainly be rejected on any production pull request, it was a fun example of leveraging some seldom used parts [TypeScript](https://www.typescriptlang.org/) which are quite cool, *and this is just the surface*!

The way I like to think about generators is that they are functions with state, which can pause /resume execution and even have values passed back-in from the caller. They are used quite heavily in libraries like `react-redux` and also have support for `async` via the `AsyncGenerator`. You can learn more about them here or feel free to ask me any questions!

- [Mozilla Docs: Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [Mozilla Docs: AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
- [Mozilla Docs: Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Mozilla Docs: Yield](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)
- [Mozilla Docs: Yield*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*)

**Happy coding!**

<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWdwMGZ1d2I4bWs2Zmgxb2VqMXR2OWQ3bjJ6aXc4M3B1a2w3czc3NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BPJmthQ3YRwD6QqcVD/giphy.gif" style="box-shadow: 0px 1px 5px rgba(0,0,0,0.1);" alt="Generator Cheers" width="100%" />

[Colin Teahan](https://www.linkedin.com/in/colin-teahan/)
---
title: 'Typescript Snippets'
description: 'Useful TypeScript snippets for everyday use which can be easily copied and pasted.'
pubDate: 'May 14 2024'
heroImage: '/typescript-banner.png'
---

### Typed Builder Pattern

The following snippet creates a typed object by progressively adding properties, this can be useful for defining different errors in an application.

**CAVEAT**: In order for the `this` in `register()` method to work correctly, the definition cannot use an arrow function.

```ts
type ErrorRegistry<T extends string> = Record<T, number> & {
    register<K extends string>(error: K, code: number): ErrorRegistry<K | T>
}

function createErrorRegistry<T extends string>(domain: T) {
    const errorRegistry = {
        register<K extends T>(error: K, code: number) {
            return {
                ...this,
                [error]: code
            } as ErrorRegistry<T | K> 
        }
    } as ErrorRegistry<T>
    return errorRegistry
}

const output = createErrorRegistry('app')
    .register('linking', 100)
    .register('billing', 200)
    .register('surface', 200)

```

[Typescript Playground Link](https://www.typescriptlang.org/play/?target=99#code/C4TwDgpgBAogTnA9nAShA5gSwM7DiAHgBUoIAPYCAOwBNspc5Mr0A+KAXijQGNkbiAGihUArgFsARhDjsAZFADeAKChqocDDkpwCAaVIVqdBnmZsAFDKRwAXFD3C+NCPbFSZASnvwbaLIyEBgA+UESsygC+ysoAZqJUPMCYiFRQPJoAhpS+yP7a+MSGlLT0jOasFjSI4pnM9kSeSqrqfFS4pAh5WoGczeoDGj06+sXG9OFWXXYOTogubhLScE0qg+tDwKJwaWsb+wB0R8AAFjiCLfvrANrWyAC69s4Ql1eRUJn0uajDhSShenYrwG0RBHy+03ygWIEQGmi2O06fl+ICiMTaHUQomAYGxfQyEGyEG+ULwIAsAHJMmAwBTPK8DpoAjpKQAbZgAa3MFOEAEYAAz8+kDRnDGSUySYVnslg8qAAJkFwvUouZ4op2G2sUyPAgcsVQvRqWwiFZEAOrMQ6AsWJx2KaAHoHVAgA)

### Branded Types

The following snippet defines a utility type `Brand<any, string>` which can be used to create an alias of an existing type, which is more strict than the original type.

```ts
declare const BrandSymbol: unique symbol

type Brand<T, Description extends string> = T & {
    [BrandSymbol]: Description
}

// example usage

type UserId = Brand<number, 'UserId'>

function trackUser(userId: UserId) {
    console.log('user:', userId)
}

const userOne = 123 as UserId
const userTwo = 123

trackUser(userOne) // ok
trackUser(userTwo) // error
```

[Typescript Playground Link](https://www.typescriptlang.org/play/?target=99#code/FAEwpgxgNghgTmABBA9gOwM4BdECE4xogDKAngLYBGKUAXIgK5oCWAjg0hhdVMMFqQAOSfIRAAeACoAaRABEwGCHGaCszdIjAAPLGCIZE2FWgDmAPkQBeRJMQAyRAG9giN4gDaoomSo0AuvQKSipqGmjAAL58APQxWtow5IJQSAwYMKZgfALCiACqGGBwAJIg1ngEROJoDFTFsgDkhcVljeZ8AGZMEOqaWAQQANYtcAAU6a0g9KNlAJTOru6omDRgAHRQKKZjjZNwtI2y+-NRfCvYjEVwAPJoSDYAjABMAMyIMIazIMAXOPuSADuKAqL1eOUGI2uE2udzACziiBQQ34kNGMOKQJQCPixTgKDgfCAA)
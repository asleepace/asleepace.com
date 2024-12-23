---
title: 'Typescript Snippets'
description: 'Useful TypeScript snippets for everyday use which can be easily copied and pasted.'
pubDate: 'May 14 2024'
heroImage: '/images/typescript-banner.png'
slug: 'typescript-snippets'
---

This document contains a collection of useful, interesting and sometimes quirky snippets of TypeScript I've gathered over the years. Some of these patterns are not unique to TypeScript, but in these examples they should be also type-safe (hopefully).

### Builder Pattern

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
        [error]: code,
      } as ErrorRegistry<T | K>
    },
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

### Monad\*

The following is a monad-like type which has support for operatings over elements of an array, or the array itself.

```ts
/**
 * This class facilitates the chaining of operations on a value,
 * each task will either return a new Monad or MonadIterable.
 */
export class Monad<I> {
  constructor(public value: I) {}

  public pipe<O>(operation: (value: I) => O[]): MonadIterable<O[]>

  public pipe<O>(operation: (value: I) => O): Monad<O>

  public pipe<O>(operation: (value: I) => O): Monad<O> | MonadIterable<O[]> {
    const result = operation(this.value)
    return Array.isArray(result) ? new MonadIterable(result) : new Monad(result)
  }

  public print(label?: string): Monad<I> {
    console.log(`${label}:` ?? 'value:', this.value)
    return this
  }
}

/**
 * This is an extension of the Monad class that allows for operations
 * on iterable values. The reduce method will convert back to
 * a basic Monad.
 */
export class MonadIterable<I extends any[]> extends Monad<any> {
  public iterate<O>(
    operation: (value: I[number], index?: number, array?: I) => O
  ): MonadIterable<O[]> {
    return new MonadIterable(this.value.map(operation))
  }

  public filter<O>(
    operation: (value: I[number], index?: number, array?: I) => O
  ): MonadIterable<I> {
    return new MonadIterable(this.value.filter(operation))
  }

  public reduce<O>(
    operation: (prev: O, value: I[number], index?: number, array?: I) => O,
    initialValue: Partial<O> = {}
  ): Monad<O> {
    return new Monad(this.value.reduce(operation, initialValue))
  }

  /**
   * Converts an iterable monad back into a normal monad.
   */
  public combine<O>(operation: (value: I) => O): Monad<O> {
    return new Monad(operation(this.value))
  }
}
```

[Try it on the TypeScript playground!](https://www.typescriptlang.org/play/?target=99#code/PQKhCgAIUgVALAlgZ0gYwDYENmoGZZqIaIAuWpApqqfJevFogHYsDmkA9nlwA6UAnCok7NUoyFkgA3LBgCulADRQYlQvEjlkAa0gB3YhkiUydAZAGVS8gc0mRmlfZACyorABMuF98y8AklRCAEYYlAB0qsDgmDiofl4APAEAfJAA3uBQ6KLIpALyaKScAgAUvPJhiGgycooAXJABAJSZAL7ZkJCV1bW8iPxJAPKpZZz8QqQizE1lsgqUTa2QALzpwwDaALotTYmeQYJYYZQjO6ldPVUk-YNno+OTwqJzC43NbeuQw3tuHp4Rpccr1bj17kCnsdpq9IPN6ktPmsNn8DkDIAAff7+Q7BE7hc7bdJZbrdNB5UiWajyDCU1Z8aEzMq0FARd6UFo5bpWGx2SAAQQEQgAnhEUIKRWUrMgaaQ2gB+RzObGBPGnKXU2ltJpOFwHDUyrU5Togm41HoCFikMrYEKUDDypr5S3MNiogEpYlc3JiTjhCIYThsMoAAwAJBlbfb2g0Q5B5YqAOTshqJpRaJDINkIzmkqm8+ws5DG8Am0AQaBwTOQFCSeyUAAeVDEMy4PFo9AO6GwuAzFEkGED+nwpQZUxmxcrEjIx1OdUWWar9CsniK9AAttZ4JxvIZBz7pIJKSFCHoSqoHCfkOaDlFoDE4r2DkdQgSAiYm5RmJ5UFhmMKLg-ZsfxVQE-2FL1TT6Gs8SoSEJkZWF4UWZZNmYeR1ztARtnTFhPEbR1HAwrD0ywIUsGFQiVm+X59gBF98QeQCSVJHlbHsXVQIY9Ui2zRYInXLBeChcdRBaXNIBNbpQXNPBiGCeDnhhWY4RTZo0OIwQcJrb8CJ1TSBFI8jKOWL4UTonFuLfL08zYvlOOfNVwmZTM+MUCI5NpQQRJeZhxJLKCwRXNdIW9BDRJUiorGkJphnTNSAg0zCtNw3SG0I9DksMyRjKosyfhUPMWDIRA5AANQRJoAAUyOmOR0XpDJOm6d0cXRFjuWsdilT1AEXNZdkImCtBKB85TUpK8qcwkqTIHLLkYAAYVEQ8BFIX97BnV8NwBSATzQPQrU4BxmFKQTjHXAE726EAYmks1anJTCWAeMZwt8t5KqRGjWuSUZMm9OyOOVfV3uU-qs3Zfzuk6MtgDWVZEaR5GUdRtH0YxzHwGAeGAFEGywddeHCbH4cx8mKcprHYgpLh5FISo6R60CygyecPgARkkiTugiAZ+DKZkcB0fLtB0Nz6BgAAmAAGGWecgPn7kFzKQny1WIhKABlAp2DKaHSSVgWymdPzkUgU2ImQYmyDKAAiO2Dd5raKFGso0EYAR8o9siIh9gRlvw-lrXlhWPPk7zxmKTh8s4aPNc4HWXWDAAOJ3FeGt3eGi9M0FsL3zYAOQMqLKGkNoAGp0Hz9N5e9PmXWtO28-yTh1wAfSjDBHfr9kgA)

### Define Class via Enum (WIP)

**NOTE**: This has only been tested on TypeScript 5.4.5 and is still expiramental, see [here for example](https://www.typescriptlang.org/play/?target=99&ts=5.5.0-beta#code/MYewdgziA2CmB0w4EMBOAKAlAKF72YArgLYAEAqhLKgMrAAWsxypA3tqZ6YVagJIATUgF5SAcj4A5ACoBRAOKyASqUkB5SavIAZbWIA0HLgDMAlqggAXScmKwR4uQA1pqjVt0GjnaMis27BzFnV3VNSR09QwBfXEsATwAHe1kiYgBhXwgIAB5pAD4Hdi5SMFgAd1J0eBq0AHMIAC5SZDB4gG0AXUxm6WxY7ATk0gB1VFNLWGQAIzg8wtFWUgBaVCmBcGh40naABVJTMFIAa1h4kGNSaU7evc7SaIBuPCGUtN3UEETcgqLvHdO20OJzOFyuN1KJGm1FIAB9SFZxmA6nDSNMQDApkd4QARZCTfq4MC2WAQRLIYD2TJ+CBsf6wAAeiRAqEspGMhDAwEspnApCQNIAYp9iKkSDlZPorvl0AQSHRGMxmrIeqQxRksj9CsUSlw1pZCKgjgLsnTdeb+eBEYRuSz0PUmmr3p9vhL8pg6f8Lbq4Gz6KYBAICDRLPjYMrnV9crIFqQ1NMAFawbnwGmmOpgdCsaJSh04L3ekwsqqgSBsxIu6gJA5HOXEBVMZAe9gFwu60tQODwaAgOroAAGQbMYEOKIrXyr2wAJKxx8lWfFov38222-Gkymh4dYB8Jwv0JZ-RApXPJ1KdavV3XqDM4M1LKhCLBDJfL6WzHVDbfw6QH0+X6+bblOMoazD+f7Pq2gFcHUsBsgAbsg0BPlgZrQZe+qGkc-qBsGoaTO0p4Lp0UHoTmpHQVQCFIShZQMpYABqNGwM2FHoZwOFBmAIZhoRlbEQ4dGMcxbGvrE7FcNEOBkaJ4kWtELS0hehZlJU9qoA0EYkLuroxqqfTenJnCxAMrykAA0mctKiICYKvGClDUA2zDYAA9K5XAAHoAPwvEk9jOcgABChwCKOfwlDw1CCM0aTQqg-xmBY1gks0iKjv8WQpXYaUPhlAwmrSjmoKQjKTGAAi0tS2SIJqwogKKaQ5PZlzFYFUqBSFFWjjKbUMI2rH-FRASwOgHLQNAI25UidSsd6HZsu0SX+CSUpZSN9yiONk0kvAZLQBM6AAESkEd0kWoepgQPAy3ZfYW3mCtdhQZd13rSSDjvc9JQmXg2ALaQxDxMVgkVBQvBZv8UX8AIzQAIwAEwAMwAZwt1TeI6QwIcXglF9P7BFM9CtLjXBlagyD3o+sD9PmQPFXtcEjcdQUgNMpBBTaxyTKgZ24B2mLdr26D07wmBAA).

This allows us to define an enum which will auto-_magically_ be created into a class definition, and then extended. This is great for a simple ORM with SQLite!

```ts
// SPECIAL TYPES

type EnumClass<T> = {
  new (...args: any[]): T
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

type EnumProps<T> = {
  [key in keyof T]: number | string | boolean | Date
}

// THE MAGIC

namespace Class {
  export function classFromEnum<E, T>(enumSchema: E): EnumClass<T> {
    return class {
      constructor(args: EnumProps<E>) {
        let hiddenState: EnumProps<E> = Object.assign({}, args)

        for (const property in enumSchema) {
          console.log(`defining property ${property}`)

          Object.defineProperty(this, property, {
            enumerable: true,
            configurable: true,
            writable: true,
            get value() {
              return hiddenState[property]
            },
            set value(nextValue) {
              hiddenState[property] = nextValue
            },
          })
        }
      }
    } as {
      new (args: EnumProps<E>): T
    }
  }
}

// EXAMPLE UASGES

enum UserSchema {
  userId = 'INTEGER NON NULL',
  firstName = 'TEXT NON NULL',
  lastName = 'TEXT NON NULL',
}

type SchemaBinding = {
  userId: number
  firstName: string
  lastName: string
}

class User extends Class.classFromEnum<typeof UserSchema, SchemaBinding>(
  UserSchema
) {
  setName(fullName: string) {
    const [firstName, lastName] = fullName.split(' ')
    this.firstName = firstName
    this.lastName = lastName
  }
}

const myUser = new User({
  userId: 123,
  firstName: 'Bob',
  lastName: 'Smitch',
  extra: true,
})

myUser.setName('Colin Teahan')

console.log(myUser.firstName) // Colin
```

[Try it on the TypeScript Playground](https://www.typescriptlang.org/play/?target=99&ts=5.5.0-beta#code/MYewdgziA2CmB0w4EMBOAKAlAKF72YArgLYAEAqhLKgMrAAWsxypA3tqZ6YVagJIATUgF5SAcj4A5ACoBRAOKyASqUkB5SavIAZbWIA0HLgDMAlqggAXScmKwR4uQA1pqjVt0GjnaMis27BzFnV3VNSR09QwBfXEsATwAHe1kiYgBhXwgIAB5pAD4Hdi5SMFgAd1J0eBq0AHMIAC5SZDB4gG0AXUxm6WxY7ATk0gB1VFNLWGQAIzg8wtFWUgBaVCmBcGh40naABVJTMFIAa1h4kGNSaU7evc7SaIBuPCGUtN3UEETcgqLvHdO20OJzOFyuN1KJGm1FIAB9SFZxmA6nDSNMQDApkd4QARZCTfq4MC2WAQRLIYD2TJ+CBsf6wAAeiRAqEspGMhDAwEspnApCQNIAYp9iKkSDlZPorvl0AQSHRGMxmrIeqQxRksj9CsUSlw1pZCKgjgLsnTdeb+eBEYRuSz0PUmmr3p9vhL8pg6f8Lbq4Gz6KYBAICDRLPjYMrnV9crIFqQ1NMAFawbnwGmmOpgdCsaJSh04L3ekwsqqgSBsxIu6gJA5HOXEBVMZAe9gFwu60tQODwaAgOroAAGQbMYEOKIrXyr2wAJKxx8lWfFov38222-Gkymh4dYB8Jwv0JZ-RApXPJ1KdavV3XqDM4M1LKhCLBDJfL6WzHVDbfw6QH0+X6+bblOMoazD+f7Pq2gFcHUsBsgAbsg0BPlgZrQZe+qGkc-qBsGoaTO0p4Lp0UHoTmpHQVQCFIShZQMpYABqNGwM2FHoZwOFBmAIZhoRlbEQ4dGMcxbGvrE7FcNEOBkaJ4kWtELS0hehZlJU9qoA0EYkLuroxqqfTenJnCxAMrykAA0mctKiICYKvGClDUA2zDYAA9K5XAAHoAPwvEk9jOcgABChwCKOfwlDw1CCM0aTQqg-xmBY1gks0iKjv8WQpXYaUPhlAwmrSjmoKQjKTGAAi0tS2SIJqwogKKaQ5PZlzFYFUqBSFFWjjKbUMI2rH-FRASwOgHLQNAI25UidSsd6HZsu0SX+CSUpZSN9yiONk0kvAZLQBM6AAESkEd0kWoepgQPAy3ZfYW3mCtdhQZd13rSSDjvc9JQmXg2ALaQxDxMVgkVBQvBZv8UX8AIzQAIwAEwAMwAZwt1TeI6QwIcXglF9P7BFM9CtLjXBlagyD3o+sD9PmQPFXtcEjcdQUgNMpBBTaxyTKgZ24B2mLdr26D07wmBAA)

---
title: 'Typescript Snippets'
description: 'Useful TypeScript snippets for everyday use which can be easily copied and pasted.'
pubDate: 'May 14 2024'
heroImage: '/blog-placeholder-3.jpg'
---

### Typed Builder Pattern

The following snippet creates a typed object by progressively adding properties, this can be useful for defining different errors in an application.

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
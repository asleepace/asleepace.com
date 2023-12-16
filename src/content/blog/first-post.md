---
title: 'Clever Extract & Replace Algorithm'
description: 'A simple algorithm for extracting strings and replacing values written in TypeScript.'
pubDate: 'Dec 16 2022'
heroImage: '/blog-placeholder-3.jpg'
---

# TLDR

A simple algorithm which recursively extracts specified keys from arbitrary data as a flat array, as well as replace those keys in the order they were extracted. 

```Typescript
export type ExtractAndReplaceProps = (
  data: unknown,
  keys: Set<string>,
  replace?: string[]
) => string[]

export const extar: ExtractAndReplaceProps = (data, keys, replace) =>
  Object.entries(data).reduce((previous, [key, value]) => {
    if (typeof value === 'object') return previous.concat(extar(value, keys, replace))
    if (typeof value === 'string' && keys.has(key)) {
      if (replace) data[key] = replace.shift() // replace that element if specified
      return previous.concat(value) // always extract original element
    }
    return previous
  }, [] as string[])

```

---
title: 'Clever Extract & Replace Algorithm'
description: 'A simple algorithm for extracting strings and replacing values written in TypeScript.'
pubDate: 'Dec 16 2022'
heroImage: '/blog-placeholder-3.jpg'
---

> A simple algorithm which recursively extracts specified keys from arbitrary data as a flat array, and can then replace those keys when called with another flat array of strings.

```ts
export type ExtractAndReplaceProps = (
  data: unknown,
  keys: Set<string>,
  replace?: string[]
) => string[]

export const extar: ExtractAndReplaceProps = (data, keys, replace) =>
  Object.entries(data).reduce((previous, [key, value]) => {
    if (typeof value === 'object')
      return previous.concat(extar(value, keys, replace))
    if (typeof value === 'string' && keys.has(key)) {
      if (replace) data[key] = replace.shift() // replace that element if specified
      return previous.concat(value) // always extract original element
    }
    return previous
  }, [] as string[])
```

The other day my colleague was working on a translation micro-service and was contemplating on how to best extract specific strings from arbitrary JSON data to send to the translation API. The translation API only accepts a flat array of strings, and would return the same translated. He was tinkering with several approaches, but to be honest they were all needlessly complex and over-engineered.

For the next couple of days this problem lingered in the back of my mind, festering, begging for a simple and elegant solution. Finally, I decided to take a stab at the problem and was quite happy with the solution (simplified above). First, things first let's map out the requirements:

- a function which takes arbitrary and possibly nested JSON data
- a set of keys which we would like to extract
- returns a flat array of strings
- a way to map these values back to the original data

The data would be fairly uniform, but could have several layers of nesting along with arbitrary keys, so my first step was just to traverse the data recursively. I remember from implementing a deep copy function in TypeScript in the past we would need something like the following:

```ts
function traverse(data: unknown) {
  if (typeof data !== 'object') return
  if (Array.isArray(data)) {
    for (const value of data) {
      traverse(value)
    }
  } else {
    for (const key in data) {
      traverse(data[key])
    }
  }
}
```

Basically, the idea is to recursively traverse any array elements and objects values. Since the `typeof` operator returns `'object'` for both arrays and objects, we also need to perform an additional check to see if the value is an array.

However, I was not happy with this approach as it felt a bit too clunky and verbose. Sometimes I really wish the `typeof` operator would return `'array'` for arrays, but then I remembered that arrays are objects in TypeScript, and that I could use this to my advantage.

```ts
function traverse(data: unknown) {
  if (typeof data !== 'object') return
  for (const keyOrIndex in data) {
    traverse(data[keyOrIndex])
  }
}
```

Sweet! The **for...in** loop will return **0, 1, 2, 3...** for arrays and **key1**, **key2**, **key3**... for objects. Not exactly groundbreaking, but this was a step in the right direction! The next step was to extract specific string values from the data. Since this data would be subject to change over time, one of the requirements was to be able to pass a list of strings which we wanted to extract. This would be a perfect place for a `Set<string>`!

```ts
function extract(data: unknown, keys: Set<string>): string[] {
  if (typeof data !== 'object') return []
  let extracted: string[] = []
  for (const keyOrIndex in data) {
    const value = data[keyOrIndex]
    if (typeof value === 'string' && keys.has(keyOrIndex)) {
      extracted.push(value)
    } else {
      const subValuesExtracted = extract(value, keys)
      extracted = extracted.concat(subValuesExtracted)
    }
  }
  return extracted
}
```

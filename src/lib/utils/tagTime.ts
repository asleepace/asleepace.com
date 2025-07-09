import chalk from 'chalk'

/**
 * Get the time portion of the current time 00:00:00
 * @returns a time string
 */
export const getTime = () => {
  return new Date().toTimeString().split(' ')[0]!
}

/**
 * Call `getTime()` and return the result with `chalk.dim(time)`
 * @returns a timestamp to log
 */
export const getTimeDimmed = () => chalk.dim(getTime())

/**
 * Returns the tag prefixed with a timestamp.
 * @param tag - place to be logged
 * @returns a timestamp tagged string
 */
export const tagTime = (tag: string) => `${getTimeDimmed()} ${tag}`

/**
 * Simple utility for prefixing tagged time.
 * ```ts
 * consoleTag('middleware)(...args)
 * ```
 */
export const consoleTag =
  (tag: string, color = chalk.cyan) =>
  (...args: any[]) =>
    console.log(tagTime(color(`[${tag}]`)), ...args)

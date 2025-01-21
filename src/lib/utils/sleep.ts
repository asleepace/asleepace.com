/**
 * ## sleep(ms)
 *
 * This method creates a Promise that resolves after the specified number of
 * milliseconds.
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export namespace Client {
  const encoder = new TextEncoder()

  export const toHexString = (uint8Array: Uint8Array<ArrayBufferLike>) => {
    return Array.from(uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  export const createRandomNoise = (initialSeed: number = Date.now()) => {
    let state = initialSeed
    return () => {
      state += Math.ceil(Math.random() * 10)
      return Math.abs(Math.sin(state * 12.9898) * 43758.5453) % 1
    }
  }

  const getSeed = createRandomNoise()
  let numberOfRefs = 0

  /**
   * Create a new unique random key by calling `hashRef` with a random value,
   * which results in items like `ref-1-647f4b2d1`
   *
   */
  export function uniqueRef(prefix: string = 'ref') {
    const randomRef = getSeed().toString(16).slice(2)
    return `${prefix}-${++numberOfRefs}-${randomRef}`
  }

  /**
   * Create a SHA-256 digest of the input and returns a hex string.
   * @param {string} input - unique value to seed.
   * @returns
   */
  export async function hashRef(input: string | ToString): Promise<string> {
    const msgUint8 = encoder.encode(input.toString()) // encode as (utf-8) Uint8Array
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8) // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
    return hashHex
  }
}

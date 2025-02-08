/**
/**
 * ## ETX
 *
 * End of Text (ETX) is the ASCII character 3, which is used to indicate the end of a message,
 * this is given as both a string and binary representation.
 *
 */
export const ETX = {
  STR: '\x03',
  NUM: 0x03,
}

/**
 * ## createBufferedStream(controller)
 *
 * Creates a new writeble stream that buffers chunks of data and sends them to the controller
 * when the ETX character is detected.
 *
 * Used in conjunction with the `ReadableStream` to create a buffered stream.
 *
 */
export function createBufferedStream(
  controller: ReadableStreamDefaultController
) {
  console.log('[buffer] creating...')
  const buffer: Uint8Array[] = []

  return new WritableStream({
    write(chunk) {
      // buffer chunks
      buffer.push(chunk)
      console.log('[buffer] buffering:', buffer.length)
      // only send data when ETX is detected
      if (chunk.includes(ETX.NUM)) {
        const output = buffer.join(',')
        controller.enqueue(`data: ${output}\n\n`)
        buffer.length = 0 // empty the buffer
        console.log('[buffer] flushing!')
      }
    },
    abort() {
      console.warn('[buffer] ABORTED!')
      controller.close()
    },
    close() {
      console.warn('[buffer] CLOSED!')
      controller.close()
    },
  })
}

/**
 * ## BufferedEventStream
 *
 * A ReadableStream that buffers events and sends them to the client in a single stream.
 *
 *
 */
function BufferedEventStream(request: Request) {
  const END_OF_TEXT = 0x03

  const buffer: Uint8Array[] = []

  const writer: WritableStream = new WritableStream({})

  const bufferOrFlush = (
    chunk: Uint8Array,
    controller: ReadableStreamDefaultController<String>
  ) => {
    buffer.push(chunk)
    if (chunk.includes(END_OF_TEXT)) {
      const fullBuffer = buffer.join('')
      controller.enqueue(String(`data: ${fullBuffer}\n\n`))
      buffer.length = 0
    }
  }

  const output = new ReadableStream({
    async start(controller) {
      // setup the abort controller
      request.signal.onabort = () => {
        console.log('[BufferedEventStream] aborting...')
        controller.close()
      }

      // start the stream
      const writer = new WritableStream<Uint8Array>({
        write: (chunk) => bufferChunkOrFlushToController(chunk, controller),
      })
    },
  })
}

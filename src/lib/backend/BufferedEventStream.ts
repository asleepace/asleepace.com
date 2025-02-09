/**
 * ## BufferedEventStream
 *
 * A ReadableStream that buffers events and sends them to the client in a single stream.
 *
 *
 */
function BufferedEventStream(request: Request, childProcess: ReturnType<typeof Bun.spawn>) {
  const END_OF_TEXT = 0x03

  const buffer: Uint8Array[] = []

  const manager = new AbortController()

  const bufferOrFlush = (
    chunk: Uint8Array,
    controller: ReadableStreamDefaultController<String>
  ) => {
    buffer.push(chunk)
    if (chunk.includes(END_OF_TEXT)) {
      const fullBuffer = buffer.join('')
      const eventData = `data: ${fullBuffer}\n\n`
      controller.enqueue(eventData)
      buffer.length = 0
    }
  }

  const output = new ReadableStream({
    async start(controller) {
      // setup the abort controller
      manager.signal.onabort = () => {
        console.log('[BufferedEventStream] abortStream aborting...')
        controller.close()
      }

      // listen for abort events on the request
      request.signal.onabort = () => {
        console.log('[BufferedEventStream] request aborting...')
        manager.abort('request aborted')
      }

      // create the writeable stream we will pipe to
      const writer = new WritableStream<Uint8Array>({
        write: (chunk) => bufferOrFlush(chunk, controller),
        close: () => {
          console.log('[BufferedEventStream] output stream closed!')
          manager.abort('output stream closed')
        },
        abort: (reason) => {
          console.log('[BufferedEventStream] output stream aborted!', reason)
          manager.abort(reason)
        },
      })

      // pipe the output stream to the writer
      await childProcess.stdout.pipeTo(writer).catch((err) => {
        console.error(`[shell/stream] ERROR stdout: \n\n${err}\n`)
        manager.abort('output stream error')
      })
    },
    cancel: () => {
      console.log('[BufferedEventStream] canceling...')
      manager.abort('canceled')
    },
  })
}

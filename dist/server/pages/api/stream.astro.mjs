export { renderers } from '../../renderers.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createEventStream({
  request,
  interval = 1e3,
  headers = {}
}) {
  const streamId = crypto.randomUUID();
  let isConnected = false;
  let count = 0;
  const stream = new ReadableStream({
    async start(controller) {
      console.log(`[${streamId}] starting!`);
      isConnected = true;
      request.signal.onabort = () => {
        console.log(`[${streamId}] aborting (onabort)!`);
        isConnected = false;
        controller.close();
        stream.cancel();
      };
    },
    async pull(controller) {
      if (request.signal.aborted || !isConnected) {
        console.log(`[${streamId}] aborting!`);
        controller.close();
        stream.cancel();
        return;
      }
      controller.enqueue(`data: ${count++}

`);
      await sleep(interval);
    },
    cancel() {
      console.log(`[${streamId}] canceling!`);
      isConnected = false;
    }
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...headers
    }
  });
}

const prerender = false;
const GET = async ({ request }) => {
  return createEventStream({ request });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

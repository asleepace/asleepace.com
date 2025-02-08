import { s as sleep } from '../../../chunks/sleep_Dbtaq-qv.mjs';
export { renderers } from '../../../renderers.mjs';

class ShellProcessManager {
  processes = /* @__PURE__ */ new Map();
  startedAt = Date.now();
  managerId = crypto.randomUUID();
  get numberOfShells() {
    return this.processes.size;
  }
  get totalRunningTime() {
    return (Date.now() - this.startedAt) / 1e3;
  }
  constructor() {
    console.log("[ShellProcessManager] starting...");
  }
  info() {
    console.table({
      name: "ShellProcessManager",
      managerId: this.managerId,
      startedAt: this.startedAt,
      numberOfShells: this.numberOfShells,
      totalRunningTime: this.totalRunningTime,
      shells: this.processes
    });
  }
  runCleanup() {
    for (const pid of this.processes.keys()) {
      const shell = this.getShell(pid);
      if (!shell || shell.childProcess.killed) {
        console.log("[ShellProcessManager] autorelease:", pid);
        this.processes.delete(pid);
      }
    }
  }
  terminate() {
    for (const pid of this.processes.keys()) {
      this.killShell(pid);
    }
  }
  killShell(pid) {
    const shell = this.getShell(pid);
    if (!shell) return;
    console.log("[ShellProcessManager] deleting shell:", shell);
    shell.childProcess.kill();
    this.processes.delete(pid);
  }
  getOrCreateShell(pid) {
    if (pid) {
      const shell = this.getShell(pid);
      if (shell) return shell;
    }
    return this.startShell();
  }
  getShell(pid) {
    return this.processes.get(pid);
  }
  startShell() {
    const childProcess = Bun.spawn(["sh"], {
      stdout: "pipe",
      stdin: "pipe",
      stderr: "pipe"
    });
    const pid = childProcess.pid;
    const shell = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      childProcess,
      pid
    };
    this.processes.set(pid, shell);
    return shell;
  }
}

const ETX = {
  STR: "",
  NUM: 3
};
function createBufferedStream(controller) {
  console.log("[buffer] creating...");
  const buffer = [];
  return new WritableStream({
    write(chunk) {
      buffer.push(chunk);
      console.log("[buffer] buffering:", buffer.length);
      if (chunk.includes(ETX.NUM)) {
        const output = buffer.join(",");
        controller.enqueue(`data: ${output}

`);
        buffer.length = 0;
        console.log("[buffer] flushing!");
      }
    },
    abort() {
      console.warn("[buffer] ABORTED!");
      controller.close();
    },
    close() {
      console.warn("[buffer] CLOSED!");
      controller.close();
    }
  });
}

const prerender = false;
const processManager = new ShellProcessManager();
const HEAD = async ({ request, cookies }) => {
  try {
    console.log(
      "||--------------------------------------------------------------------------------------------------||"
    );
    processManager.runCleanup();
    const shell = processManager.startShell();
    console.log("[HEAD] shell:", shell.pid);
    cookies.set("pid", shell.pid.toString());
    return new Response(null, {
      statusText: "OK",
      status: 200,
      headers: {
        "x-shell-pid": shell.pid.toString()
      }
    });
  } catch (error) {
    console.error("[HEAD] error:", error);
    cookies.delete("pid");
    return new Response(null, {
      statusText: error.message ?? "Unknown error",
      status: 500
    });
  } finally {
    processManager.runCleanup();
  }
};
const GET = async ({ request, cookies }) => {
  console.log(
    "||==================================================================================================||"
  );
  const pid = cookies.get("pid")?.number();
  if (!pid) {
    console.warn("[GET] Missing PID cookie");
    return new Response(null, { status: 404, statusText: "Missing PID" });
  }
  processManager.runCleanup();
  const shell = processManager.getOrCreateShell(pid);
  console.log("[GET] shell:", shell.pid, "killed:", shell.childProcess.killed);
  if (shell.childProcess.killed) {
    console.warn("[GET] shell has already been killed!");
    cookies.delete("pid");
    return new Response(null, {
      statusText: "Shell killed",
      status: 500
    });
  }
  const { childProcess } = shell;
  let onStreamReady;
  const waitForStreamToFinish = new Promise((resolve) => {
    onStreamReady = resolve;
  });
  const stream = new ReadableStream({
    async start(controller) {
      console.log("[stream] stream...");
      request.signal.onabort = () => {
        console.warn("[stream] aborting...");
        controller.close();
      };
      const bufferedStream = createBufferedStream(controller);
      setTimeout(() => {
        console.log("[stream] stream ready!");
        onStreamReady?.(true);
      }, 300);
      setTimeout(() => {
        controller.enqueue("data: \n\n");
      }, 1e3);
      return childProcess.stdout.pipeTo(bufferedStream).then(() => {
        console.log("[stream] finished piping!");
      }).catch((err) => {
        console.warn(`[stream] error: 

	${err}
`);
        controller.close();
      });
    },
    cancel() {
      console.warn("[stream] canceling...");
      childProcess.kill();
      processManager.runCleanup();
    }
  });
  console.log("[stream] waiting for stream...");
  await waitForStreamToFinish;
  if (stream.locked) {
    console.warn("[stream] stream is locked (sleeping 1s)");
    await sleep(1e3);
  }
  console.log("[GET] finished!");
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
    status: 200
  });
};
const POST = async ({ request, cookies }) => {
  try {
    const shellPid = cookies.get("pid")?.number();
    console.log("[POST] PID:", shellPid);
    const { command } = await request.json().catch(async (error) => {
      console.log("[POST] JSON error:", error?.message ?? "Unknown error");
      const plainText = await request.text();
      return JSON.parse(plainText);
    });
    if (!shellPid) throw new Error("Missing PID cookie");
    console.log("[shell/stream] POST shellPid:", shellPid);
    const shell = processManager.getShell(shellPid);
    if (!shell) throw new Error("Shell not found");
    const { childProcess } = shell;
    if (!command || typeof command !== "string")
      throw new Error("Invalid command");
    if (!childProcess) throw new Error("Shell not initialized");
    if (childProcess.killed) throw new Error("Shell killed");
    if (!childProcess.stdin) throw new Error("Shell is not writable");
    if (typeof childProcess.stdin.write !== "function")
      throw new Error("Shell stdin is not writable");
    console.log("[shell/stream] writing command:", command);
    childProcess.stdin.write(
      `${command}

    echo "{\\"cmd\\":\\"${command}\\",\\"usr\\":\\"$USER\\",\\"dir\\":\\"$PWD\\"}";
`
    );
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error) {
    console.error("[shell/stream] error:", error);
    return new Response(null, {
      statusText: error.message ?? "Unknown error",
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  HEAD,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

import chalk from 'chalk';
export { renderers } from '../../../renderers.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
let bufferId = 0;
const MAKE_TAG = () => chalk.gray(" ↳ [buffer]");
function createBufferedStream(controller) {
  const TAG = MAKE_TAG();
  console.log(TAG, chalk.gray("starting id:"), bufferId++);
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
        console.log(TAG, chalk.gray("flushing!"));
      }
    },
    abort() {
      console.warn(TAG, chalk.red("ABORTED!"));
      controller.close();
    },
    close() {
      console.warn(TAG, chalk.gray("closing..."));
      controller.close();
    }
  });
}

const prerender = false;
const processManager = new ShellProcessManager();
const TAG = (prefix) => chalk.gray(`[${prefix}] ↳ /stream	`);
const HEAD = async ({ cookies }) => {
  try {
    processManager.runCleanup();
    const shell = processManager.startShell();
    console.log(TAG("H"), chalk.white("PID:"), chalk.yellow(shell.pid));
    cookies.set("pid", shell.pid.toString());
    return new Response(null, {
      statusText: "OK",
      status: 200,
      headers: {
        "x-shell-pid": shell.pid.toString()
      }
    });
  } catch (error) {
    console.error(TAG("H"), chalk.red(error));
    cookies.delete("pid", { path: "/" });
    return new Response(null, {
      statusText: error.message ?? "Unknown error",
      status: 500
    });
  } finally {
    processManager.runCleanup();
  }
};
const GET = async ({ request, cookies }) => {
  const pid = cookies.get("pid")?.number();
  if (!pid) {
    console.warn("[GET] Missing PID cookie");
    return new Response(null, { status: 404, statusText: "Missing PID" });
  }
  processManager.runCleanup();
  const shell = processManager.getOrCreateShell(pid);
  console.log(
    TAG("G"),
    chalk.white("PID:"),
    chalk.yellow(pid),
    shell.childProcess.killed ? chalk.red("(killed)") : "(alive)"
  );
  if (shell.childProcess.killed) {
    console.warn(TAG("G"), chalk.red("shell killed!"));
    cookies.delete("pid", { path: "/" });
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
  const STREAM_TAG = chalk.gray("[G][stream]");
  const stream = new ReadableStream({
    async start(controller) {
      console.log(STREAM_TAG, chalk.gray("starting readbale stream"));
      request.signal.onabort = () => {
        console.warn(
          STREAM_TAG,
          chalk.red("request aborted, closing stream...")
        );
        controller.close();
      };
      const bufferedStream = createBufferedStream(controller);
      setTimeout(() => {
        console.log(STREAM_TAG, chalk.gray("ready!"));
        onStreamReady?.(true);
      }, 300);
      setTimeout(() => {
        console.log(STREAM_TAG, chalk.white("initial enqueue!"));
        controller.enqueue("data: \n\n");
      }, 1e3);
      return childProcess.stdout.pipeTo(bufferedStream).then(() => {
        console.log(STREAM_TAG, "piped!");
      }).catch((err) => {
        console.warn(STREAM_TAG, chalk.red(err));
        controller.close();
      });
    },
    cancel() {
      console.warn(STREAM_TAG, chalk.yellow("cancelling..."));
      childProcess.kill();
      processManager.runCleanup();
    }
  });
  console.log(STREAM_TAG, chalk.gray("waiting..."));
  await waitForStreamToFinish;
  if (stream.locked) {
    console.warn(STREAM_TAG, chalk.yellow("locked!"), chalk.gray("sleeping 1s"));
    await sleep(1e3);
  }
  console.log(STREAM_TAG, chalk.gray("finished!"));
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

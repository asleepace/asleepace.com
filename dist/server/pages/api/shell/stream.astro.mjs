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

const prerender = false;
const processManager = new ShellProcessManager();
const ETX = {
  STR: "",
  NUM: 3
};
const HEAD = async ({ request, cookies }) => {
  console.log("[shell/stream] HEAD request:", cookies);
  const shellPidCookie = cookies.get("pid");
  const shell = processManager.getOrCreateShell(shellPidCookie?.number());
  const shellPidString = shell.pid.toString();
  console.log("[shell/stream] pid:", shellPidString);
  cookies.set("pid", shellPidString);
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "x-shell-pid": shellPidString
    }
  });
};
const GET = async ({ request, cookies }) => {
  console.log("[shell/stream] GET shell stream:", request.headers);
  const shellPidCookie = cookies.get("pid");
  const shellPid = shellPidCookie?.number();
  console.log("[shell/stream] shellPidCookie:", shellPidCookie);
  const shell = processManager.getOrCreateShell(shellPid);
  if (shellPid !== shell.pid) {
    console.log(`[shell/stream] updated from:${shellPid} to:${shell.pid}`);
    cookies.set("pid", shell.pid.toString());
  }
  console.log("[shell/stream] shellPid:", shellPid);
  const { childProcess } = shell;
  let onStreamDidFinish;
  const waitForStreamToFinish = new Promise((resolve) => {
    onStreamDidFinish = resolve;
  });
  const stream = new ReadableStream({
    async start(controller) {
      const buffer = [];
      request.signal.onabort = () => {
        console.warn("[shell/stream] aborting...");
        childProcess.kill();
        controller.close();
      };
      const output = new WritableStream({
        write(chunk) {
          buffer.push(chunk);
          console.log("[shell/stream] buffer:", buffer);
          if (chunk.includes(ETX.NUM)) {
            console.log("[shell/stream] ETX detected!");
            const output2 = buffer.join(",");
            controller.enqueue(`data: ${output2}

`);
            buffer.length = 0;
          }
          onStreamDidFinish?.(true);
        },
        abort() {
          console.warn("[shell/stream] writeable stream aborted!");
          childProcess.kill();
          controller.close();
        },
        close() {
          console.warn("[shell/stream] writeable stream closed!");
          controller.close();
        }
      });
      console.log(
        "[shell/stream] waiting for child process:",
        childProcess.signalCode
      );
      childProcess.stdin.write('echo "Hello, world!";\n');
      await childProcess.stdout.pipeTo(output).then(() => {
        console.log("[shell/stream] finished piping!");
      }).catch((err) => {
        console.error(`[shell/stream] ERROR stdout: 

	${err}
`);
        childProcess.kill();
        controller.close();
      }).finally(() => {
        console.log("[shell/stream] finally...");
      });
    },
    cancel() {
      console.warn("[shell/stream] killing child process!");
      childProcess.kill();
    }
  });
  console.log("[shell/stream] waiting for stream to finish...");
  await waitForStreamToFinish;
  console.log("[shell/stream] stream finished!");
  if (stream.locked) {
    console.warn("[shell/stream] stream is locked!");
    return new Response("Stream is locked", { status: 500 });
  }
  const clientResponseStream = await new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
    status: 200
  });
  return clientResponseStream;
};
const POST = async ({ request, cookies }) => {
  const { command } = await request.json();
  const shellPidCookie = cookies.get("pid");
  const shellPid = shellPidCookie?.number();
  if (!shellPid) {
    console.warn("[shell/stream] missing PID cookie");
    return new Response("Missing PID cookie", { status: 404 });
  }
  console.log("[shell/stream] POST shellPid:", shellPid);
  const shell = processManager.getShell(shellPid);
  if (!shell) {
    return new Response("Shell not found", { status: 404 });
  }
  const { childProcess } = shell;
  if (!command || typeof command !== "string") {
    return new Response("Invalid command", { status: 400 });
  }
  if (!childProcess) {
    return new Response("Shell not initialized", { status: 500 });
  }
  if (childProcess.killed) {
    return new Response("Shell killed", { status: 500 });
  }
  if (!childProcess.stdin) {
    return new Response("Shell not initialized", { status: 500 });
  }
  if (typeof childProcess.stdin.write !== "function") {
    return new Response("Shell is not writable", { status: 500 });
  }
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

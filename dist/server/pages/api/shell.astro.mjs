export { renderers } from '../../renderers.mjs';

const prerender = false;
let shell;
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Transfer-Encoding": "chunked",
  "Cache-Control": "no-cache"
};
const WHOAMI = String(process.env.USER);
const PWD = String(process.env.PWD);
function ShellResponse(type, command, output) {
  const status = type === "command" ? 200 : 500;
  const resp = {
    type,
    command,
    output,
    whoami: WHOAMI,
    pwd: PWD
  };
  return new Response(JSON.stringify(resp), { status, headers: HEADERS });
}
const POST = async ({ request }) => {
  const args = await request.json();
  if (!args.command || typeof args.command !== "string") {
    return ShellResponse("error", [], "INVALID COMMAND");
  }
  const commands = args.command.split(" ");
  console.log("=============================================================");
  console.log("[shell] ARGS:", args);
  console.log(`[shell] PID: ${shell?.pid} KILLED: ${shell?.killed}`);
  if (!shell || shell.killed) {
    console.log("[shell] initializing shell...");
    shell = Bun.spawn(["bun", "scripts/shell.ts"], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      ipc(message, subprocess) {
        console.log("[shell] ipc:", message);
      },
      onExit(subprocess, exitCode, signalCode, error) {
        console.log(
          "[shell] onExit code:",
          exitCode,
          "signal",
          signalCode,
          "error",
          error
        );
      }
    });
  }
  if (!shell) return ShellResponse("error", commands, "ERROR: SHELL_NOT_FOUND");
  if (shell.killed)
    return ShellResponse("error", commands, "ERROR: SHELL_KILLED");
  if (!shell.stdin)
    return ShellResponse("error", commands, "ERROR: SHELL_NOT_WRITABLE");
  if (typeof shell.stdin === "number")
    return ShellResponse("error", commands, "ERROR: SHELL_INVALID_STDIN");
  if (typeof shell.stdout === "number")
    return ShellResponse("error", commands, "ERROR: SHELL_INVALID_STDOUT");
  console.log(`[shell] exec: "${args.command}"`);
  shell.stdin.write(args.command);
  shell.stdin.flush();
  shell.stdin.end();
  console.log("[shell] reading stdout...");
  const data = await new Response(shell.stdout).text();
  console.log("[shell] stdout:", data);
  return ShellResponse("command", commands, data);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

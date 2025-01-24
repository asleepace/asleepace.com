import type { Subprocess } from 'bun'

type ShellProcess = Subprocess<'pipe', 'pipe', 'pipe'>

type PID = ShellProcess['pid']

type Shell = {
  childProcess: ShellProcess
  createdAt: number
  updatedAt: number
  pid: PID
}

/**
 * ## Shell Process Manager
 *
 * A simple class which manages multiple child shell processes.
 *
 */
export class ShellProcessManager {
  private readonly processes: Map<PID, Shell> = new Map()
  private readonly startedAt = Date.now()
  private readonly managerId = crypto.randomUUID()

  get numberOfShells(): number {
    return this.processes.size
  }

  get totalRunningTime(): number {
    return (Date.now() - this.startedAt) / 1000
  }

  constructor() {
    console.log('[ShellProcessManager] starting...')
  }

  info(): void {
    console.table({
      name: 'ShellProcessManager',
      managerId: this.managerId,
      startedAt: this.startedAt,
      numberOfShells: this.numberOfShells,
      totalRunningTime: this.totalRunningTime,
      shells: this.processes,
    })
  }

  terminate(): void {
    for (const pid of this.processes.keys()) {
      this.killShell(pid)
    }
  }

  killShell(pid: PID): void {
    const shell = this.getShell(pid)
    if (!shell) return
    console.log('[ShellProcessManager] deleting shell:', shell)
    shell.childProcess.kill()
    this.processes.delete(pid)
  }

  getOrCreateShell(pid: PID | undefined | null): Shell {
    if (pid) {
      const shell = this.getShell(pid)
      if (shell) return shell
    }
    return this.startShell()
  }

  getShell(pid: PID): Shell | undefined {
    return this.processes.get(pid)
  }

  startShell(): Shell {
    const childProcess = Bun.spawn(['sh'], {
      stdout: 'pipe',
      stdin: 'pipe',
      stderr: 'pipe',
    })

    const pid = childProcess.pid

    const shell: Shell = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      childProcess,
      pid,
    }

    this.processes.set(pid, shell)

    return shell
  }
}

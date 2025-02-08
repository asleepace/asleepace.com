import { useCallback, useEffect, useRef, useState } from 'react'
import AdminCommandOutput from './AdminCommandOutput'
import { useShellStream } from './useShellStream'

export type CommandResult = {
  type?: 'command' | 'error'
  command: string[]
  output: string
  whoami: string
  pwd: string
}

/**
 * ## AdminCommandLine
 *
 * This is a client-side react island which handles executing command line arguments
 * on the backend server.
 *
 */
export default function AdminCommandLine() {
  const prevCommandsRef = useRef<string[]>([]).current
  const inputRef = useRef<HTMLInputElement>(null)
  const [output, onRunCommandStream, onRegisterShell] = useShellStream()

  const onRunCommand = useCallback(
    async (command: string) => {
      prevCommandsRef.push(command)
      onRunCommandStream(command)?.catch((err) => {
        console.warn('[AdminCommandLine] error', err)
      })
    },
    [onRunCommandStream]
  )

  const onSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    if (e.shiftKey && e.key === 'Enter') return
    e.preventDefault()
    const command = inputRef.current?.value?.trim()
    inputRef.current!.value = ''
    if (!command) return false
    onRunCommand(command)
  }, [])

  /**
   * NOTE: This is a ref callback that is used to set the input ref and register
   * a new shell when the input is focused. This is called to prevent the useEffect
   * hook from double mounting and deadlocking the stream.
   */
  const onInitializeShell = useCallback(
    (htmlInput: HTMLInputElement | null) => {
      if (inputRef.current) return
      if (!htmlInput) return
      inputRef.current = htmlInput
      htmlInput.focus()
      onRegisterShell()
    },
    []
  )

  return (
    <div className="bg-black rounded-2xl flex-1 p-1 self-stretch max-w-screen-lg max-h-[500px] flex flex-col">
      <AdminCommandOutput data={output} />
      <div className="flex flex-row px-2 py-1">
        <p className="text-green-500 font-mono text-sm self-center font-bold">
          $
        </p>
        <input
          ref={onInitializeShell}
          id="cli-input"
          type="text"
          className="flex flex-shrink font-mono text-sm tracking-wide text-green-500 bg-transparent ring-0 focus:ring-0 focus:outline-none focus:border-orange-500 rounded-md p-2"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Run command..."
          onKeyDown={onSubmit}
        />
      </div>
    </div>
  )
}

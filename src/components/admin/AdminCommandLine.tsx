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

async function execute(command: string): Promise<CommandResult> {
  const response = await fetch('/api/shell', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      command
    }),
  })
  console.log('[AdminCommandLine] response', response)
  const data = await response.json()
  console.log('[AdminCommandLine] data', data)
  return data
}

const formatError = (command: string, error: Error): CommandResult => ({
  command: [command],
  output: error?.message,
  whoami: 'system',
  pwd: 'error',
  type: 'error',
})

export default function AdminCommandLine() {
  // const [output, setOutput] = useState<CommandResult[]>([])
  const prevCommandsRef = useRef<string[]>([]).current
  const inputRef = useRef<HTMLInputElement>(null)

  const [output, onRunCommandStream] = useShellStream()

  const onRunCommand = useCallback(async (command: string) => {
    prevCommandsRef.push(command)
    onRunCommandStream(command).catch((err) => {
      console.warn('[AdminCommandLine] error', err)
    })
    // return execute(command)
    //   .then((result) => {
    //     setOutput((prev) => [...prev, result])
    //   })
    //   .catch((error) => {
    //     console.warn('[AdminCommandLine] error', error)
    //     setOutput((prev) => [...prev, formatError(command, error)])
    //   })
  }, [onRunCommandStream])

  const onSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    if (e.shiftKey && e.key === 'Enter') return
    e.preventDefault()
    const command = inputRef.current?.value?.trim()
    inputRef.current!.value = ''
    if (!command) return false
    onRunCommand(command)
  }, [])

  return (
    <div className="bg-black rounded-2xl flex-1 p-1 self-stretch max-w-screen-lg max-h-[500px] flex flex-col">
      <AdminCommandOutput data={output} />
      <div className="flex flex-row px-2 py-1">
        <p className='text-green-500 font-mono text-sm self-center font-bold'>$</p>
        <input
          ref={inputRef}
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

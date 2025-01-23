import { useCallback, useEffect, useRef, useState } from 'react'

type CommandResult = {
  command: string[]
  output: string
  whoami: string
  pwd: string
}

async function execute(command: string): Promise<CommandResult> {
  const response = await fetch('/api/system/command', {
    method: 'POST',
    body: command,
  })
  console.log('[AdminCommandLine] response', response)
  const data = await response.json()
  console.log('[AdminCommandLine] data', data)
  return data
}

const formatOutput = (result: CommandResult) => (prev: string[]) => {
  return [
    ...prev,
    `${result.pwd}@${result.whoami} $ ${result.command}`,
    result.output,
  ]
}

export default function AdminCommandLine() {
  const [output, setOutput] = useState<string[]>([])
  const prevCommandsRef = useRef<string[]>([]).current
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    if (e.shiftKey && e.key === 'Enter') return
    e.preventDefault()
    const command = inputRef.current?.value?.trim()
    inputRef.current!.value = ''
    if (!command) return false
    console.log('[AdminCommandLine] submit', command)
    prevCommandsRef.push(command)
    execute(command)
      .then((result) => {
        setOutput(formatOutput(result))
      })
      .catch((error) => {
        setOutput((prev) => [...prev, error?.message])
      })
    return false
  }, [])

  return (
    <div className="flex flex-col flex-1 self-stretch border-2 border-solid border-zinc-800 rounded-xl">
      <textarea
        className="flex-1 flex-grow ring-0 focus:ring-0 scrollbar-none focus:outline-none bg-transparent text-gray-200 p-2 font-mono text-sm"
        contentEditable={false}
        value={output.join('\n')}
        id="cli-output"
        readOnly
      />
      <input
        ref={inputRef}
        id="cli-input"
        type="text"
        className="flex flex-shrink bg-transparent ring-0 focus:ring-0 focus:outline-none focus:border-orange-500 rounded-md p-2 text-white"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Run command..."
        onKeyDown={onSubmit}
      />
    </div>
  )
}

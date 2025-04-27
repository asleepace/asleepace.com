import clsx from 'clsx'
import { type CommandResult } from './AdminCommandLine'
import { useRef, useEffect } from 'react'

type CommandOutputProps = {
  data: CommandResult[]
}

/**
 * ## AdminCommandOutput
 *
 * Displays a list of command results.
 *
 */
function AdminCommandOutput({ data }: CommandOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [data.length])

  return (
    <div
      ref={containerRef}
      className="flex flex-col justify-start gap-y-0 p-2 flex-1 overflow-auto scrollbar-none"
    >
      {data.map((result, index) => (
        <AdminCommandResultItem result={result} key={index} />
      ))}
    </div>
  )
}

function AdminCommandResultItem({ result }: { result: CommandResult }) {
  const isError = result.type === 'error'
  const command =
    result?.command && Array.isArray(result.command)
      ? result.command.join(' ')
      : result.command
  return (
    <div className="flex flex-col gap-y-1 grow text-sm">
      <p className="tracking-wide font-mono">
        <span className={clsx('text-purple-500', isError && 'text-white')}>
          {result.whoami}
        </span>
        <span className="text-gray-500">@</span>
        <span className={clsx('text-blue-500', isError && 'text-red-500')}>
          {result.pwd}
        </span>
        <span className="text-green-500 mx-2">$ {command.toString()}</span>
      </p>
      {result.output && (
        <pre className="text-zinc-500 mb-2">{result.output}</pre>
      )}
    </div>
  )
}

export default AdminCommandOutput

import clsx from 'clsx'
import { type CommandResult } from './AdminCommandLine'

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
  return (
    <div className="flex flex-col gap-y-0 p-2 flex-grow overflow-auto scrollbar-none">
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
    <div className="flex flex-col gap-y-1 flex-grow text-sm">
      <p className="tracking-wide font-mono">
        <span className={clsx('text-purple-500', isError && 'text-white')}>
          {result.whoami}
        </span>
        <span className="text-gray-500">@</span>
        <span className={clsx('text-blue-500', isError && 'text-red-500')}>
          {result.pwd}
        </span>
        <span className="text-green-500 mx-2">
          $ {command.toString()}
        </span>
      </p>
      {result.output && (
        <pre className="text-zinc-500 mb-2">{result.output}</pre>
      )}
    </div>
  )
}

export default AdminCommandOutput

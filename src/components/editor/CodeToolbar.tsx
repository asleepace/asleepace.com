import clsx from 'clsx'
import { Play, Save, Settings } from 'lucide-react'

export type CodeToolbarProps = {
  onSave: () => void
  onRun: () => void
  onSettings: () => void
}

export function CodeToolbar(props: CodeToolbarProps) {
  return (
    <div className="absolute z-10 top-4 right-4 flex flex-row items-center justify-end h-10 overflow-clip z-top border-[1px] bg-zinc-900 border-zinc-600 rounded-full">
      <CodeToolbarButton
        className="hover:bg-zinc-600 px-4 border-r-[1px] border-zinc-600"
        name="Settings"
        icon={Settings}
        onClick={props.onSettings}
      />
      <CodeToolbarButton
        className="hover:bg-zinc-600 border-r-[1px] border-zinc-600 px-2"
        name="Save code"
        icon={Save}
        onClick={props.onSave}
      />
      <CodeToolbarButton
        className="hover:bg-zinc-600 px-2"
        name="Run code"
        icon={Play}
        onClick={props.onRun}
      />
    </div>
  )
}

type CodeToolbarButtonProps = {
  name: string
  icon: typeof Play | typeof Save
  onClick: () => void
  className?: string
}

export function CodeToolbarButton({
  className,
  icon: Icon,
  onClick,
}: CodeToolbarButtonProps) {
  return (
    <button
      className={clsx(
        'text-white px-3 py-2 h-full *:hover:opacity-75',
        className
      )}
      onClick={onClick}
    >
      <Icon color="white" size={18} />
    </button>
  )
}

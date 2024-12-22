import { FileWarning } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { memo, isValidElement } from 'react'

export type AppIconName = keyof typeof LucideIcons

export type AppIconComponentType = typeof FileWarning

type AppIconProps = {
  icon: AppIconName
  size?: number
  color?: string
  className?: string
}

function AppIcon({
  icon,
  size,
  color,
  className = 'text-gray-400',
}: AppIconProps) {
  const Icon = LucideIcons[icon] as AppIconComponentType

  if (!isValidElement(Icon)) {
    return <FileWarning size={size} />
  }

  return <Icon className={className} size={size} color={color} />
}

export default memo(AppIcon)

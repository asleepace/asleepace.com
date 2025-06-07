import { type LucideIconName, type LucideIcon } from './types'

const cached = new Map<LucideIconName, LucideIcon>()

/**
 * Dyanmically import ALL lucide icons and extract the ones needed.
 */
export async function lazyLoadIcon(name: LucideIconName): Promise<LucideIcon> {
  return (await import('lucide-react'))[name] as LucideIcon
}

/**
 * Dynamically import the specified Lucide icons at runtime.
 * @param {string} name - icon to import
 */
export async function getDynamicIcon(
  name: LucideIconName
): Promise<LucideIcon> {
  const cachedIcon = cached.get(name)
  if (cachedIcon) return cachedIcon
  const icon = await lazyLoadIcon(name)
  cached.set(name, icon)
  return icon
}

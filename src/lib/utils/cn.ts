import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Dynamic Tailwind classnames which are merged using tailwind-merge.
 * @param inputs - ClassValue[]
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

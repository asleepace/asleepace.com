import * as LucideIcons from 'lucide-react'

export type LucideIconsExports = typeof LucideIcons

export type LucideIconName = keyof LucideIconsExports

/**
 *  Dynamic Lucde Icons in Astro are a bit tricky and have several rough edges,
 *  here we import all exports to get a list of names and then select a random
 *  icon like "search" to get the prop types.
 *
 *  @TODO filter out invalid icon types.
 *
 */
export type LucideIcon = LucideIconsExports['Search'] // pick a random icon to get props

export type AstroButtonProps = astroHTML.JSX.ButtonHTMLAttributes

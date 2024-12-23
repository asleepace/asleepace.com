export type AstroBlogItem = {
  slug: string
  data: AstroBlogData
}

export type AstroBlogData = {
  title: string
  pubDate: Date
  description: string
  heroImage?: string | undefined
  updatedDate?: Date | undefined
}

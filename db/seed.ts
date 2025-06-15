import { db, PageMetrics } from 'astro:db'

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(PageMetrics).values([
    {
      route: '/',
      views: 1000,
      likes: 12,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
}

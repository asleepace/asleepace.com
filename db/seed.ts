import { db, PageMetrics } from 'astro:db'

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(PageMetrics).values([
    {
      route: '/',
      views: 1,
      likes: 1,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
}

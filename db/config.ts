import { defineDb, defineTable, column } from 'astro:db'

const PageMetrics = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    route: column.text({ unique: true }),
    views: column.number(),
    likes: column.number(),
    comments: column.json(),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    PageMetrics,
  },
})

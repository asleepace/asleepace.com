import { defineDb, defineTable, column, NOW } from 'astro:db'

export const PageMetrics = defineTable({
  columns: {
    route: column.text({ primaryKey: true }),
    views: column.number({ default: 0 }),
    likes: column.number({ default: 0 }),
    comments: column.json({ default: [] }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['route'] }],
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    PageMetrics,
  },
})

import { Database } from 'bun:sqlite'

// open or create a new metrics.sqlite file
const metrics = new Database('metrics.sqlite', { create: true})



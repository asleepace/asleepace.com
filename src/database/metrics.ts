import { Database } from 'bun:sqlite'

// open or create a new metrics.sqlite file
const metrics = new Database('metrics.sqlite', { create: true})


metrics.query("CREATE TABLE IF NOT EXISTS some_table (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value INTEGER)");

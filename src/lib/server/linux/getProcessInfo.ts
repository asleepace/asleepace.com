/**
 ---
 ---------------------------------------------------------
  Process Info API & Parsing
 ---------------------------------------------------------
 ---
 */

export type ProcessInfo = {
  USER: string | 'root' | 'asleepace'
  PID: number
  CPU: number
  MEM: number
  VSZ: number
  RSS: number
  TT: string
  STAT: string | 'Ss'
  STARTED: Date
  TIME: number
  COMMAND: string
}

export type Columns = keyof ProcessInfo

export type Parsers = {
  [Columns: string]: (data: string) => ProcessInfo[Columns]
}

// --------------------- helpers ---------------------

const Seperator = {
  NEW_LINE: '\n',
  WHITE_SPACE: /\s+/,
  TAB: '\t',
}

const parsers: Parsers = {
  VSZ: Number,
  PID: Number,
  RSS: Number,
  CPU: Number,
  MEM: Number,
  STARTED: (val: string) => {
    return val
  },
  TIME: (val: string | undefined) => {
    if (!val) return 0
    const [hoursMins, seconds] = val.split('.')
    const [hours, minutes] = hoursMins.split(':')
    return (
      Number(hours) * 3600000 + Number(minutes) * 60000 + Number(seconds) * 1000
    )
  },
  USER: String,
  TT: String,
  STAT: String,
  COMMAND: String,
  // LINUX SPECIFIC
  START: String,
}

/**
 *
 * @main ## getProcessInfo()
 *
 * Calls the `ps aux` command and returns the output as a JSON object.
 *
 */
export async function getProcessInfo(): Promise<ProcessInfo[]> {
  const proc = Bun.spawn(['ps', 'aux'], {
    stdout: 'pipe',
  })

  const output = await new Response(proc.stdout).text()
  const processInfo = parseProcessData(output)
  return processInfo
}

/**
 *
 * ## parseProcessData(rawData)
 *
 * Parse raw string returned from `ps aux` command into an array of ProcessInfo objects.
 *
 * @note this can be quite large!
 *
 */
const parseProcessData = (rawData: string): ProcessInfo[] => {
  const [tableHeaders, ...tableData] = rawData.trim().split(Seperator.NEW_LINE)

  // Parse column headers

  const columns = tableHeaders
    .split(Seperator.WHITE_SPACE)
    .filter((line) => line.length > 1 && line.at(1))
    .map((name) => name.replace('%', '') as Columns)

  // Process all lines in one go

  return tableData.map((line) => iterate(columns, line)) as ProcessInfo[]
}

/**
 *
 * ## iterate(columns, text)
 *
 * @note this is a helper function to quickly parse process info data
 * into an object in a single pass.
 *
 */
function iterate<C extends string>(columns: C[], text: string) {
  const values = text.split(Seperator.WHITE_SPACE)
  type InferredColumns = (typeof columns)[number]
  const lastColumnIndex = columns.length - 1
  const lastColumn = columns[lastColumnIndex] as InferredColumns
  let columnsWithValues = {} as Record<InferredColumns, any>
  for (let i = 0; i < lastColumnIndex; i++) {
    const parse = parsers[columns[i]]
    // NOTE: values returned on Linux machines might be different than
    // expected, so we need to handle that here.
    if (!parse) {
      console.warn(`[getProcessInfo] No parser found for column: ${columns[i]}`)
      columnsWithValues[columns[i]] = values[i]
    } else {
      columnsWithValues[columns[i]] = parse(values[i])
    }
  }
  columnsWithValues[lastColumn] = values.slice(lastColumnIndex).join(' ')
  return columnsWithValues
}

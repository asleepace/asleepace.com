export type SpawnProcessResultType = 'result' | 'error'

export type SpawnProcessResult = {
  type: SpawnProcessResultType
  commands: string[]
  output: string
}

const makeResult = (
  type: SpawnProcessResultType,
  commands: string[],
  output: string
): SpawnProcessResult => {
  return {
    type,
    commands,
    output,
  }
}

export async function spawnProcess(
  ...commands: string[]
): Promise<SpawnProcessResult> {
  let process = Bun.spawn({
    cmd: [...commands],
    stdout: 'pipe',
  })
  try {
    const output = await new Response(process.stdout).text()
    return makeResult('result', commands, output)
  } catch (error) {
    return makeResult('error', commands, error.message)
  } finally {
    process?.kill()
  }
}

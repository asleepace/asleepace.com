import { $ } from 'bun'

const Commands = {
  FREE_MEMORY: `free -b`,
  FREE_MEMORY_JSON: `free -b | awk 'NR==2 {mem_total=$2; mem_used=$3; mem_free=$4} NR==3 {printf "{\"memory\":{\"total\":%d,\"used\":%d,\"free\":%d},\"swap\":{\"total\":%d,\"used\":%d,\"free\":%d}}", mem_total, mem_used, mem_free, $2, $3, $4}'`,
}

/**
 * ## getFreeMemory()
 *
 * This function runs the `free -b` command and returns the output as a JSON object.
 *
 */
export async function getFreeMemory() {
  const freeMemory = await $`${Commands.FREE_MEMORY_JSON}`.json()
  console.log('[getFreeMemory] freeMemory:', freeMemory)
  return freeMemory
}

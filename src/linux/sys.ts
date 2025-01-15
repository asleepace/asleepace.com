import { $ } from 'bun'

const Commands = {
  FREE_MEMORY: `free -b | awk 'NR==2 {mem_total=$2; mem_used=$3; mem_free=$4} NR==3 {printf "{\"memory\":{\"total\":%d,\"used\":%d,\"free\":%d},\"swap\":{\"total\":%d,\"used\":%d,\"free\":%d}}", mem_total, mem_used, mem_free, $2, $3, $4}'`,
}

async function getFreeMemoryJSON() {
  const free = await $`${Commands.FREE_MEMORY}`.json()
  return free
}

export namespace System {
  export const readFreeMemory = getFreeMemoryJSON
}

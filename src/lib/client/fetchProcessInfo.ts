import type { ProcessInfo } from '../server/linux/getProcessInfo'

/**
 * ## fetchProcessInfo()
 *
 * Fetches the process information from the backend API.
 *
 * @note see 'src/pages/api/system/info.ts` for more information
 *
 * @note frontend only!
 *
 */
export async function fetchProcessInfo(): Promise<ProcessInfo[]> {
  return fetch('/api/system/info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error('[fetchProcessInfo] failed', error)
      throw error
    })
}

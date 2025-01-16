/**
 * ## getProcessInfo()
 *
 * Calls our `/api/system/info` route and returns the response json.
 *
 */
export async function getProcessInfo() {
  const response = await fetch('/api/system/info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const processInfo = await response.json()
  return processInfo
}

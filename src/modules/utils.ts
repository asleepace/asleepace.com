/**
 * Check if the current request is a POST request.
 */
export function isPostRequest(request: Request): boolean {
  return request.method === 'POST'
}

/**
 * Extract and convert form data into an object.
 */
export async function parseFormData<T extends {}>(request: Request): Promise<T> {
  if (isPostRequest(request)) return {} as T
  const data = await request.formData()
  const output = [...data.entries()].reduce((output, [name, value]) => ({ ...output, [name]: value }), {})
  console.log('[utils] output:', output)
  return output as T
}
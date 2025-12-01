/**
 * ## fetchGrokBasic
 *
 * Simple function which fetches a response from the Grok api and returns
 * the first message content.
 */
export async function fetchGrokBasic({ prompt = '', temperature = 0.7 }): Promise<string> {
  if (!import.meta.env.GROK_API_KEY) {
    throw new Error('[fetch-grok] missing (.env) api for GROK_API_KEY')
  }
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-4-fast-non-reasoning',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature,
    }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Grok API error: ${response.status} - ${error}`)
  }
  const result = await response.json()
  return result.choices[0].message.content
}

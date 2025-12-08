/**
 * @app reddit/index.ts
 * @description a simple background job for scraping reddit.
 */
const frontPage = 'https://old.reddit.com/r/wallstreetbets/comments.json'

async function fetchReddit(url: string) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'accept-language': 'en-US,en;q=0.9',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        referer: 'https://www.google.com/',
        cookie: String(import.meta.env.CHROME_COOKIE_REDDIT),
      },
    })
    if (!resp.ok) throw new Error(`Failed to fetch reddit (${resp.status})`)
    const data = await resp.json()
    return data
  } catch (e) {
    console.warn('[reddit] error:', e)
  }
}

async function findDailyDiscussionThread() {
  const dailyThread = await fetchReddit(
    '"https://www.reddit.com/r/wallstreetbets/search.json?q=daily+discussion&restrict_sr=1&sort=new&limit=1"'
  )
    .then((res) => JSON.stringify(res, null, 2))
    .then(console.log)
}

findDailyDiscussionThread()

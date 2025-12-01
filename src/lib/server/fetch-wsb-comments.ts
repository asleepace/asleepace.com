/**
 * @file src/lib/server/fetch-wsb-comments.ts
 * @description fetch the daily discussion thread on wall street bets and extract the comments as json.
 */
import puppeteer, { Page } from 'puppeteer'

/**
 * Shared configuration.
 */
const config = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  width: 1920,
  height: 1080,
} as const

/**
 * Helper function to find the daily discussion link from the WSB homepage.
 */
async function findDailyDiscussionLink(page: Page) {
  return page.evaluate(() => {
    const links: HTMLLinkElement[] = Array.from(document.querySelectorAll('a[href]'))

    return links.find((link) => {
      const text = link.textContent?.toLowerCase() || ''
      const href = link.getAttribute('href') || ''

      // Match "Daily Discussion Thread" variations
      return (
        (text.includes('daily discussion') ||
          text.includes('daily thread') ||
          text.includes('what are your moves tomorrow')) &&
        href.includes('/comments/')
      )
    })?.href
  })
}

/**
 * Helper for extracting comments from wallstreetbets.
 */
async function extractNestedPageComments(page: Page): Promise<WallStreetBetsComment[]> {
  return await page.evaluate(() => {
    function parseComment(commentEl: Element): any {
      const author = commentEl.querySelector('.author')?.textContent || null
      const score = commentEl.querySelector('.score.unvoted')?.getAttribute('title') || '0'
      const time = commentEl.querySelector('time')?.getAttribute('datetime') || null
      const body = commentEl.querySelector('.usertext-body .md')?.textContent?.trim() || ''
      const permalink = commentEl.querySelector('.bylink')?.getAttribute('href') || null
      const id = commentEl.getAttribute('data-fullname') || null
      const flair = commentEl.querySelector('.flair')?.textContent?.trim() || null

      // Navigate: .child > .sitetable.listing > .thing.comment (direct children only)
      const sitetable = commentEl.querySelector(':scope > .child > .sitetable.listing')
      const replies = sitetable
        ? Array.from(sitetable.querySelectorAll(':scope > .thing.comment')).map((reply) => parseComment(reply))
        : []

      return {
        id,
        author,
        score: parseInt(score),
        timestamp: time,
        flair,
        body,
        // permalink: permalink ? `https://old.reddit.com${permalink}` : null,
        replies,
      }
    }

    // Top-level: .sitetable.nestedlisting > .thing.comment
    return Array.from(document.querySelectorAll('.sitetable.nestedlisting > .thing.comment')).map((comment) =>
      parseComment(comment)
    )
  })
}

export type WallStreetBetsComment = {
  id: string
  author: string
  score: number
  timestamp: string
  flair: string | null
  body: string
  replies: WallStreetBetsComment[]
}

export type WallStreetBetsData = {
  comments: WallStreetBetsComment[]
  html: string
}

export async function fetchWallStreetBetsComments(options: { limit?: number }) {
  const browser = await puppeteer.launch({
    executablePath: import.meta.env.CHROME_EXECUTABLE_PATH, // Use snap chromium
    args: [
      `--window-size=${config.width},${config.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    headless: true,
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: config.width,
    height: config.height,
  })
  await page.setUserAgent(config.userAgent)
  await page.goto('https://www.reddit.com/r/wallstreetbets/')
  const discussionLink = await findDailyDiscussionLink(page)
  if (!discussionLink) {
    const content = await page.content()
    throw new Error(`Failed to find discussion link:\n\n${content}`)
  }
  // swap url with old reddit api for ssr rendering
  const oldReddit = new URL(discussionLink.replace('www.reddit.com', 'old.reddit.com'))
  oldReddit.searchParams.set('limit', String(options.limit ?? 200))
  await page.goto(oldReddit.href)
  const json = await extractNestedPageComments(page)
  const html = await page.content()
  return { json, html }
}

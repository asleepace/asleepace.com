import type { APIRoute } from 'astro'
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
 * Single browser instance which will be re-used.
 */
const browser = await puppeteer.launch({
  args: [`--window-size=${config.width},${config.height}`],
  headless: true,
})

/**
 * Helper for extracting comments from wallstreetbets.
 */
async function extractNestedPageComments(page: Page) {
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
        permalink: permalink ? `https://old.reddit.com${permalink}` : null,
        replies,
      }
    }

    // Top-level: .sitetable.nestedlisting > .thing.comment
    return Array.from(document.querySelectorAll('.sitetable.nestedlisting > .thing.comment')).map((comment) =>
      parseComment(comment)
    )
  })
}

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

export async function fetchDailyDiscussionComments(options: { limit?: number }) {
  const page = await browser.newPage()
  await page.setViewport({
    width: config.width,
    height: config.height,
  })
  await page.setUserAgent(config.userAgent)
  await page.goto('https://www.reddit.com/r/wallstreetbets/')
  const discussionLink = await findDailyDiscussionLink(page)
  if (!discussionLink) throw new Error('Failed to find discussion link.')
  // swap url with old reddit api for ssr rendering
  const oldReddit = new URL(discussionLink.replace('www.reddit.com', 'old.reddit.com'))
  oldReddit.searchParams.set('limit', String(options.limit ?? 200))
  await page.goto(oldReddit.href)
  const json = await extractNestedPageComments(page)
  const html = await page.content()
  return { json, html }
}

/**
 * GET /api/web-scraper/wsb
 *
 * This Astro endpoint returns a JSON array of comments from the wall street bets
 * daily discussion thread.
 *
 * Takes an optional url param `?html` which will just return the contents of the
 * page instead.
 */
export const GET: APIRoute = async (ctx) => {
  const isHtmlOnly = !!ctx.url.searchParams.get('html')
  const limit = Number(ctx.url.searchParams.get('limit') ?? '200')
  const wallStreetBets = await fetchDailyDiscussionComments({ limit })
  if (isHtmlOnly) return new Response(wallStreetBets.html)
  return Response.json(wallStreetBets.json)
}

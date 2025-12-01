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

export async function fetchRemoteWebPage(options: { url: string }) {
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  await page.setUserAgent(config.userAgent)
  await page.goto(options.url)

  const discussionLink = await page.evaluate(() => {
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

  if (!discussionLink) throw new Error('Failed to find discussion link.')

  const oldReddit = new URL(discussionLink.replace('www.reddit.com', 'old.reddit.com'))
  oldReddit.searchParams.set('limit', '500')
  await page.goto(oldReddit.href)

  const comments = await extractNestedPageComments(page)
  const html = await page.content()

  return { comments, html }
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
  const wallStreetBets = await fetchRemoteWebPage({ url: 'https://www.reddit.com/r/wallstreetbets/' })
  if (isHtmlOnly) return new Response(wallStreetBets.html)
  return Response.json(wallStreetBets.comments)
}

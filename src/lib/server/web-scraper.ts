import puppeteer from 'puppeteer'

export async function fetchRemoteWebPage(options: { url: string }) {
  const browser = await puppeteer.launch({
    headless: true,
  })

  const page = await browser.newPage()
  await page.goto(options.url)

  const title = await page.title()
  console.log('[web-scraper] opened:', title)

  await browser.close()
}

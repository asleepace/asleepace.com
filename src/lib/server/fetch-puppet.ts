import { Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// NOTE: Use stealth mode
puppeteer.use(StealthPlugin())

// Simple helper for parsing cookie string
function parseCookies(cookieString: string | undefined) {
  if (!cookieString) return []
  return cookieString.split('; ').map((cookie) => {
    const [name, ...valueParts] = cookie.split('=')
    return {
      name: name.trim(),
      value: valueParts.join('='),
      domain: '.reddit.com',
      path: '/',
      httpOnly: true,
      secure: true,
    }
  })
}

/**
 * ## Fetch Puppet
 *
 * Returns an object containing the puppeteer page and browser,
 * make sure to explicitely close or use the dispose.
 */
export async function fetchPuppet(params: {
  width?: number
  height?: number
  cookie?: string
  timeout?: number
  headers?: Record<string, string>
}) {
  const { width = 1920, height = 1080, timeout = 30_000, headers = {}, cookie } = params

  // Step 1. Setup browser
  const browser = await puppeteer.launch({
    executablePath: import.meta.env.CHROME_EXECUTABLE_PATH, // Use snap chromium
    args: [
      `--window-size=${params.width},${params.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--incognito', // Start in incognito
    ],
    headless: true,
  })

  if (cookie) {
    const cookies = parseCookies(cookie)
    await browser.setCookie(...cookies)
  }

  // Step 2. Setup page
  const page = await browser.newPage()
  await page.setViewport({ width, height })

  if (Object.keys(headers).length) {
    await page.setExtraHTTPHeaders({ ...headers })
  }

  // Step 3. Navigate to page
  // await page.goto(params.url, { waitUntil: 'networkidle2', timeout })

  return {
    page,
    browser,
  }
}

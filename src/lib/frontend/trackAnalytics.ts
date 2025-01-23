/**
 * ## trackAnalytics()
 *
 * This function tracks analytics for the website by calling the `/api/analytics` endpoint.
 *
 * @note fronted only!
 *
 */
export async function trackAnalytics(): Promise<boolean> {
  if (typeof window === 'undefined') {
    console.warn(
      '[trackAnalytics] called from non-browser context, skipping...'
    )
    return false
  }
  return fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'user-agent': navigator.userAgent,
      referer: document.referrer,
    },
  })
    .then((res) => res.ok)
    .catch((error) => {
      console.warn('[trackAnalytics] failed', error)
      return false
    })
}

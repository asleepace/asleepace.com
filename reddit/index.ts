/**
 * @app reddit/index.ts
 * @description a simple background job for scraping reddit.
 */
const frontPage = 'https://old.reddit.com/r/wallstreetbets/comments.json'

const example = {
  kind: 't1',
  data: {
    subreddit_id: 't5_2th52',
    approved_at_utc: null,
    author_is_blocked: false,
    comment_type: null,
    link_title: 'What Are Your Moves Tomorrow, December 08, 2025',
    mod_reason_by: null,
    banned_by: null,
    ups: 1,
    num_reports: null,
    author_flair_type: 'text',
    total_awards_received: 0,
    subreddit: 'wallstreetbets',
    link_author: 'wsbapp',
    likes: null,
    replies: '',
    user_reports: [],
    saved: false,
    id: 'nswfeuu',
    banned_at_utc: null,
    mod_reason_title: null,
    gilded: 0,
    archived: false,
    collapsed_reason_code: null,
    no_follow: true,
    author: 'paddywacker220',
    num_comments: 3686,
    can_mod_post: false,
    send_replies: true,
    parent_id: 't1_nswbvu3',
    score: 1,
    author_fullname: 't2_3jwcf0ra',
    over_18: false,
    report_reasons: null,
    removal_reason: null,
    approved_by: null,
    controversiality: 0,
    body: 'I usually jack off to r/barelylegalteens',
    edited: false,
    top_awarded_type: null,
    downs: 0,
    author_flair_css_class: null,
    is_submitter: false,
    collapsed: false,
    author_flair_richtext: [],
    author_patreon_flair: false,
    body_html:
      '&lt;div class="md"&gt;&lt;p&gt;I usually jack off to &lt;a href="/r/barelylegalteens"&gt;r/barelylegalteens&lt;/a&gt;&lt;/p&gt;\n&lt;/div&gt;',
    gildings: {},
    collapsed_reason: null,
    distinguished: null,
    associated_award: null,
    stickied: false,
    author_premium: false,
    can_gild: false,
    link_id: 't3_1pgte0r',
    unrepliable_reason: null,
    author_flair_text_color: null,
    score_hidden: false,
    permalink: '/r/wallstreetbets/comments/1pgte0r/what_are_your_moves_tomorrow_december_08_2025/nswfeuu/',
    subreddit_type: 'public',
    link_permalink:
      'https://old.reddit.com/r/wallstreetbets/comments/1pgte0r/what_are_your_moves_tomorrow_december_08_2025/',
    name: 't1_nswfeuu',
    author_flair_template_id: null,
    subreddit_name_prefixed: 'r/wallstreetbets',
    author_flair_text: null,
    treatment_tags: [],
    created: 1765177917,
    created_utc: 1765177917,
    awarders: [],
    all_awardings: [],
    locked: false,
    author_flair_background_color: null,
    collapsed_because_crowd_control: null,
    mod_reports: [],
    quarantine: false,
    mod_note: null,
    link_url: 'https://old.reddit.com/r/wallstreetbets/comments/1pgte0r/what_are_your_moves_tomorrow_december_08_2025/',
  },
}

type RedditComment = typeof example

type RedditPage = {
  kind: 'Listing' | string
  data: {
    after: 't1_nswfeuu' | string
    dist: number
    modhash: string
    geo_filter: string
    children: RedditComment[]
  }
}

async function fetchReddit<T = any>(url: string): Promise<T> {
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
    return data as T
  } catch (e) {
    console.warn('[reddit] error:', e)
    if (e instanceof Error) throw e
    throw new Error(String(e))
  }
}

async function fintDailyDiscussionThreads(): Promise<any[]> {
  return fetchReddit<RedditPage>(frontPage)
    .then((json) => json.data.children)
    .then((data) => data.map((comment) => comment.data?.permalink))
    .then((data) => data.filter(Boolean))
    .then((data) => [
      ...new Set(
        data.filter((t) => t.includes('what_are_your_moves_tomorrow')).map((t) => t.split('/').slice(0, 6).join('/'))
      ),
    ])
    .then((data) => data.map((link) => `https://old.reddit.com${link}.json`))
    .then((data) => data.map((link) => fetchReddit(link)))
    .then(async (promises) => await Promise.allSettled(promises))
    .then((resolved) => resolved.map((item) => (item.status === 'fulfilled' ? item.value : undefined)))
    .then((resolved) => resolved.filter((comment) => comment !== undefined))
    .then((resolved) => resolved as RedditPage[][])
    .then((resolved) => resolved.filter((thread) => thread && typeof thread === 'object'))
    .then((comments) => comments.at(0)?.map((data) => data.data.children))
    .then((comments) => comments?.map((data) => data.map((item) => item.data.body_html)))
}

fintDailyDiscussionThreads().then((data) => console.log('[reddit] daily threads:', JSON.stringify(data)))

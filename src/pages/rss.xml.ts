import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { siteData } from '@/consts'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('blog')
  console.log('[rss] generating rss feed:', posts)
  return rss({
    title: siteData.title,
    description: siteData.description,
    site: context.site || siteData.url,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.data.slug}/`,
    })),
  })
}

import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { siteData } from '@/consts'

export const GET = async (context) => {
  console.log('[rss.xml] Generating RSS feed')
  const posts = await getCollection('blog')
  return rss({
    title: siteData.title,
    description: siteData.description,
    site: context.site || siteData.url,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  })
}

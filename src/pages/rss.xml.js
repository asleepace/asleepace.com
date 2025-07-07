import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { siteConfig } from '@/consts'

const { title, description, url } = siteConfig

export const GET = async (context) => {
  console.log('[rss.xml] Generating RSS feed')
  const posts = await getCollection('blog')
  return rss({
    title,
    description,
    site: context.site || url,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  })
}

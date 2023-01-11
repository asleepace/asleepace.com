import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export const getHtmlFromMarkdown = async (markdown: string): Promise<string> => {
  const matterResult = matter(markdown)
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  
  return processedContent.toString()
}
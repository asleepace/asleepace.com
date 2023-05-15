import Head from 'next/head'
import { getFilesInDirectory } from '../logic/fileSystem'
import { getHtmlFromMarkdown } from '../logic/getHtmlFromMarkdown'
import Article from '@components/article'

import '@styles/article.css'


export default async function Home() {

  const file = await getFilesInDirectory('docs')
  const html = await getHtmlFromMarkdown(file[3].content)
  console.log(html.match(/<h2>(.*)<\/h2>/g))

  return (
    <>
      <Head>
        <title>Asleepace</title>
        <meta name="description" content="A website dedicated to everything developer!" />
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <div className="article">
          <Article markdown={file[4].content} />
        </div>
    </>
  )
}

import { Inter } from '@next/font/google'
import { Varela_Round } from '@next/font/google'
import ArticleBody from './article-body'
import ArticleHeader from './article-header'
import ArticleImage from './article-image'

const inter = Inter({ subsets: ['latin'] })

interface ArticleProps {
  children: React.ReactNode
}

const MyArticle = {
  title: "My First Article",
  date: new Date,
  name: "Colin Teahan",
  content: "This is my article"
}

export default function Article({ children }: ArticleProps) {
  const { title, name, date, content } = MyArticle
  return (
    <div className={`w-4/6 mt-12 ${inter.className} bg-white p-4 px-8 rounded-xl`}>
      <ArticleHeader title={title} name={name} date={date} />
      <ArticleImage />
      <ArticleBody>
        {content}
      </ArticleBody>
    </div>
  )
}
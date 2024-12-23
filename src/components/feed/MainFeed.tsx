import FeedPost from './FeedPost'

export type FeedData = {
  content: string
  author: string
  createdAt: Date
  category: string
  likes?: number
  comments?: number
}

const data: FeedData[] = [
  {
    content:
      'Stock market bounces on positive PCE data after tumultuous Fed meeting',
    author: '@asleepace',
    createdAt: new Date(),
    category: 'Finance',
  },
  {
    content:
      'Stock crashes after Fed meeting reveals inflation concerns are rising again after cutting rates',
    author: '@asleepace',
    createdAt: new Date(),
    category: 'Finance',
  },
]

export default function MainFeed() {
  return (
    <div className="flex flex-col items-center justify-between max-w-screen-sm mx-auto overflow-hidden">
      {data.map((article, index) => {
        return <FeedPost key={index} {...article} />
      })}
    </div>
  )
}

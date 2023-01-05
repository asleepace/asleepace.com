interface ArticleHeaderProps {
  title: string
  name: string
  date: Date
}

export default function ArticleHeader({ title, name, date }: ArticleHeaderProps) {
  
  const nameString = `By ${name}`
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  })


  return (
    <div className="p-6">
      <h1 className="text-3xl font-black pb-1">{title}</h1>
      <h2 className="text-black/50">{dateString}</h2>
      <h3 className="text-black/50">{nameString}</h3>
    </div>
  )
}
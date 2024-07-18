export function RecentBlogs() {
  const articles = ['Programming Article', 'Other Article', 'Featured']
  return (
    <div className="flex flex-1 items-center justify-between">
      {articles.map((article, index) => {
        return <RecentBlog key={index} title={article} />
      })}
    </div>
  )
}

export function RecentBlog(props: any) {
  return (
    <div className="flex px-8 py-4 flex-col items-center justify-between">
      <p>{props.title}</p>
    </div>
  )
}

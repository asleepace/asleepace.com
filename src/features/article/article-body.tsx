interface ArticleBodyProps {
  children: React.ReactNode
}

export default function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <div className="p-6">
      {children}
    </div>
  )
}
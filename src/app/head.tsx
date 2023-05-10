type HeadProps = {
  title?: string
  favicon?: string
}

export default function Head({ title = 'Asleepace', favicon ='/favicon.ico' }: HeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link rel="icon" href={favicon} />
    </>
  )
}

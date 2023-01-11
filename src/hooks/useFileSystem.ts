import { join } from 'path'
import fs from 'fs'
import { useEffect, useState } from 'react'

type File = {
  name: string
  path: string
  get(): string
}

const getDirectory = (path: string) =>join(process.cwd(), path)


export function useFileSystem(dir: string) {

  const [files, setFiles] = useState<File[]>()
  const directory = join(process.cwd(), dir)
  const fileNames = fs.readdirSync(directory)

  useEffect(() => {
    const directoryFiles: File[] = fileNames.map((name) => {
      const path = getDirectory(name)
      const get = () => fs.readFileSync(path, 'utf-8')
      return {
        name, path, get
      }
    })

    setFiles(directoryFiles)

  }, [fileNames])

  return files
}
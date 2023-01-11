import { join } from 'path'
import fs from 'fs'

export type File = {
  name: string
  path: string
  get(): string
}

export const getDirectory = (path: string) => join(process.cwd(), path)

export const getFilesInDirectory = async (path: string): Promise<File[]> => {
  const files = await fs.readdirSync(getDirectory(path))
  return files.map((name) => {
    const path = getDirectory(name)
    const get = () => fs.readFileSync(path, 'utf-8')
    return {
      name, path, get
    }
  })
}

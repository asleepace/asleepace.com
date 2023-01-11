import { join } from 'path'
import fs from 'fs'

export type File = {
  name: string
  path: string
  content: string
}

export const getDirectoryPath = (path: string) => join(process.cwd(), path)

export const getFileFromPath = (path: string) => {

  const directory = getDirectoryPath(path)

}

export const getFilesInDirectory = async (directory: string): Promise<File[]> => {
  const path = getDirectoryPath(directory)
  const files = await fs.readdirSync(path)
  return files.map((name) => {
    const filePath = join(path, name)
    const content = fs.readFileSync(filePath, 'utf-8')
    return {
      name, path: filePath, content
    }
  })
}

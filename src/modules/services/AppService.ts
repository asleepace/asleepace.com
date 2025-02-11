/**
 * ## AppService
 *
 * A service that can be used to persist data to a file.
 *
 * https://stackoverflow.com/questions/35743426/async-constructor-functions-in-typescript
 *
 */
export abstract class AppService {
  filePath: string
  hasUnsavedChanges = false

  constructor() {
    process.on('exit', () => this.saveToStorage())
    process.on('SIGINT', () => this.saveToStorage())
    process.on('SIGTERM', () => this.saveToStorage())
  }

  async getPersistedData(
    callback: (data: typeof this | undefined) => void
  ): Promise<void> {
    const file = Bun.file(this.filePath)
    const exists = await file.exists()
    if (!exists) return callback(undefined)
    const json = await file.json()
    console.log('[AppService] getPersistedData', json)
    return callback(json as typeof this)
  }

  async saveToStorage(): Promise<boolean> {
    try {
      if (!this.hasUnsavedChanges) {
        console.log('[AppService] saveToStorage', 'no unsaved changes')
        return true
      }
      const primitiveData = Object.entries(this).reduce((acc, [key, value]) => {
        if (typeof value === 'function') return acc
        return { ...acc, [key]: value }
      }, {})
      const json = JSON.stringify(primitiveData, null, 2)
      await Bun.write(this.filePath, json)
      return true
    } catch (e) {
      console.error('[AppService] saveToStorage', e)
      return false
    }
  }

  [Symbol.dispose]() {
    console.log('[AppService] disposing...')
    return this.saveToStorage().catch((e) => {
      console.error('[AppService] dispose', e)
    })
  }
}

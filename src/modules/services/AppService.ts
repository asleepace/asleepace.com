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

  constructor() {
    process.on('exit', () => this.saveToStorage())
    process.on('SIGINT', () => this.saveToStorage())
    process.on('SIGTERM', () => this.saveToStorage())
  }

  async getPersistedData() {
    const file = Bun.file(this.filePath)
    const exists = await file.exists()
    if (!exists) return undefined
    const json = await file.json()
    console.log('[AppService] getPersistedData', json)
    return json as typeof this
  }

  async saveToStorage() {
    try {
      console.log('[AppService] disposing...')
      const primitiveData = Object.entries(this).reduce((acc, [key, value]) => {
        if (typeof value === 'function') return acc
        return { ...acc, [key]: value }
      }, {})
      const json = JSON.stringify(primitiveData, null, 2)
      await Bun.write(this.filePath, json)
    } catch (e) {
      console.error('[AppService] saveToStorage', e)
    }
  }

  [Symbol.dispose]() {
    console.log('[AppService] disposing...')
    return this.saveToStorage().catch((e) => {
      console.error('[AppService] dispose', e)
    })
  }
}

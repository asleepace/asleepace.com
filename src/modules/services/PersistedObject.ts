interface UserData {
  userName: string
  userEmail: string
  createdAt: Date
  updatedAt: Date
}

// Make loadStorageData generic
const loadStorageData = async <T>(): Promise<T> => {
  return new Promise((resolve) => {
    const persistedObjectExample = {
      userName: 'asleepace',
      userEmail: 'colin_teahan@yahoo.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    requestAnimationFrame(() => {
      resolve(persistedObjectExample as T)
    })
  })
}

class PersistedObject {
  protected isReady = Promise.resolve()

  protected initFromStorage<T extends typeof this = typeof this>(
    callback: (data: T) => void
  ) {
    console.log('initFromStorage()')

    this.isReady = loadStorageData<T>().then((persistedObj) => {
      console.log('persistedObj:', persistedObj)
      callback(persistedObj)
    })
  }
}

class MyUserSettings extends PersistedObject {
  public userName: string
  public userEmail: string
  public createdAt: Date
  public updatedAt: Date

  constructor(env: any) {
    super()
    this.initFromStorage((persistedObj) => {
      // Now persistedObj is correctly typed as UserData
      this.userName = persistedObj.userName
      this.userEmail = persistedObj.userEmail
      this.createdAt = persistedObj.createdAt
      this.updatedAt = persistedObj.updatedAt
    })
  }
}

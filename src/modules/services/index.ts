import { ServicePermissions } from './ServicePermissions'

const permissions = new ServicePermissions()

const registry = new FinalizationRegistry((value) => {
  console.log('[FinalizationRegistry] disposing', value)
  if (value instanceof ServicePermissions) {
    value.saveToStorage()
  }
})

registry.register(permissions, 'permissions')

export const services = {
  permissions,
}

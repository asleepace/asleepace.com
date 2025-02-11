import { AppService } from './AppService'

type ClientPermissions = typeof DEFAULT_CLIENT_PERMISSIONS

const DEFAULT_CLIENT_PERMISSIONS = {
  accelerometer: true,
  camera: true,
  geolocation: true,
  gyroscope: true,
  magnetometer: true,
  microphone: false,
  payment: false,
  usb: false,
}

/**
 *  ## ServicePermissions
 *
 *  A service that can be used to manage the permissions of the client.
 *
 *  'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
 *
 */
export class ServicePermissions extends AppService {
  filePath = './servicePermissions.json'
  permissions: ClientPermissions
  isEnabled: boolean

  constructor() {
    super()
    this.getPersistedData((storage) => {
      console.log('[ServicePermissions] storage', storage)
      this.permissions = storage?.permissions ?? {
        ...DEFAULT_CLIENT_PERMISSIONS,
      }
      this.isEnabled = storage?.isEnabled ?? true
      console.log('[ServicePermissions] initialized', this)
    })
  }

  setPermission(permission: keyof ClientPermissions, value: boolean) {
    this.permissions[permission] = value
    this.hasUnsavedChanges = true
  }

  getHeader() {
    if (!this.isEnabled) return undefined
    return Object.entries(this.permissions)
      .filter(([_, value]) => value)
      .map(([key]) => `${key}=()`)
      .join(', ')
  }
}

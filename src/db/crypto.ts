import crypto from 'crypto'

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex')
}

export function generateHash(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)
}

export function compareHash(password: string, salt: string, hash: string) {
  return hash === generateHash(password, salt)
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function generateSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

export function generateVerificationCode() {
  return crypto.randomBytes(8).toString('hex')
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function generateResetPasswordToken() {
  return crypto.randomBytes(32).toString('hex')
}
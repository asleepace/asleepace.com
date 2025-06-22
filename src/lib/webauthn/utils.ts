import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'

/**
 *  WebAuthN: Utils
 *
 *  This file contains several commonly used utilities for verification with WebAuthN,
 *  NOTE: these can only be used on the server.
 */

export interface WebAuthNAuthenticatorFlags {
  userPresent: boolean
  userVerified: boolean
  attestedCredentialDataIncluded: boolean
  extensionDataIncluded: boolean
}

export interface WebAuthNAuthenticatorData {
  readonly rpIdHash: Buffer
  readonly flags: WebAuthNAuthenticatorFlags
  readonly signCount: number
  readonly buffer: Buffer
}

export interface ClientDataJSON {
  challenge: string
  origin: string
  type: 'webauthn.create' | 'webauthn.get'
  crossOrigin?: boolean
}

/**
 *  Hash the data as a 256 digest buffer.
 */
export const hashSha256 = (data: string): Buffer => {
  return createHash('sha256').update(data, 'utf-8').digest()
}

/**
 *  Shared configuration.
 */
export namespace WebAuthN {
  export const RP_ID: string = process.env.WEBAUTHN_RP_ID!
  export const RP_ORIGIN: string = process.env.WEBAUTHN_RP_ORIGIN!
  export const RP_ID_HASH = new Uint8Array(hashSha256(RP_ID))
  export const RP_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  console.assert(RP_ID.length !== 0, 'Missing (.env) RP_ID=example')
  console.assert(RP_ORIGIN.length !== 0, 'Missing (.env) RP_ORIGIN=https://example.com')

  export const GetType = 'webauthn.get'
  export const CreateType = 'webauthn.create'
}

/**
 *  Deocde a base64 encoded string as a UTF-8 string.
 */
export const decodeBase64 = (base64: string): string => {
  return Buffer.from(base64, 'base64url').toString('utf-8')
}

/**
 *  Decode a base64 encoded string as JSON.
 */
export const decodeBase64JSON = <T = any>(base64: string): T => {
  return JSON.parse(decodeBase64(base64)) as T
}

/**
 *  Decodes the Authenticator Data present in the Public Key Credential
 *  https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAssertionResponse/authenticatorData
 *
 *  @param {AuthenticatorAssertionResponse} response - JSON form.
 */
export const decodeAuthenticatorData = (response: PublicKeyCredentialJSON): WebAuthNAuthenticatorData => {
  const buffer = Buffer.from(response.authenticatorData, 'base64url')
  let offset = 0

  // rpIdHash (32 bytes) - SHA256 hash of the RP ID
  const rpIdHash = buffer.subarray(offset, offset + 32)
  offset += 32

  // flags (1 byte)
  const flagsByte = buffer[offset]
  offset += 1

  // Parse flags
  const flags: WebAuthNAuthenticatorFlags = {
    userPresent: !!(flagsByte & 0x01), // UP - User Present
    userVerified: !!(flagsByte & 0x04), // UV - User Verified
    attestedCredentialDataIncluded: !!(flagsByte & 0x40), // AT - Attested credential data included
    extensionDataIncluded: !!(flagsByte & 0x80), // ED - Extension data included
  } as const

  // signCount (4 bytes, big-endian)
  const signCount = buffer.readUInt32BE(offset)
  offset += 4

  return {
    rpIdHash,
    flags,
    signCount,
    buffer, // Keep original buffer for signature verification
  } as const
}

import { Credentials } from '@/db'
import type { APIRoute } from 'astro'

export const prerender = false

//  Delete WebAuthN Passkey
//
//  This endpoint is used to delete a passkey registered to the currently
//  logged in user. NOTE: pass the first 4 cahrs of the passkey which should
//  be deleted in order to prevent exposing sensitive data.
//
export const DELETE: APIRoute = (ctx) => {
  const { user } = ctx.locals

  if (!user) throw new Error('Not authorized!')

  //  Step #1: fetch all passkeys for current user
  const credentials = Credentials.getCredentialsForUser(user)
  if (!credentials) throw new Error('No credentials found for user.')

  //  Step #2: extract id search param
  const id = ctx.url.searchParams.get('id')
  if (!id) throw new Error('Missing id param for passkeys!')

  //  Step #3: match passkey for id param
  const credential = credentials.find((cred) => cred.publicKey.startsWith(id))
  if (!credential) throw new Error('No credential found for id: ' + id)

  console.log('[webauthn] deleting credential:', credential)

  //  Step #4: delete passkey and return status
  const success = Credentials.deleteCredential({ credentialId: credential.id })
  return Response.json({ success })
}

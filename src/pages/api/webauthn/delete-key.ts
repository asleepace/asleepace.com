import { passkeys } from '@/db'
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
  const userPasskeys = passkeys.getPasskeysForUser(user)
  if (!userPasskeys) throw new Error('No passkeys for user')

  //  Step #2: extract id search param
  const id = ctx.url.searchParams.get('id')
  if (!id) throw new Error('Missing id param for passkeys!')

  //  Step #3: match passkey for id param
  const passkey = userPasskeys.find((pk) => pk.passkey.startsWith(id))
  if (!passkey) throw new Error('No passkey found for id: ' + id)

  console.log('[webauthn] deleting passkey:', passkey)

  //  Step #4: delete passkey and return status
  const success = passkeys.deletePasskey(passkey)
  return Response.json({ success })
}

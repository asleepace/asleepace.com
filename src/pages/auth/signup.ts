import type { APIRoute } from 'astro'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Config } from '../../config'

// server-side rendering
export const prerender = false;

// handle auth requests
export const post: APIRoute = async ({ params, request }) => {

  const { body, credentials, headers, formData } = request
  console.log('[signup.ts] headers:', headers)
  console.log('[signup.ts] credentials:', credentials)
  console.log('[signup.ts] formData:', params)
  console.log('[signup.ts] body:', body)

  // extract the data from the request
  const data = await request.formData()
  console.log('[signup.ts] data:', data)
  const email = String(data.get("email"))
  const username = String(data.get("username"))
  const password = String(data.get("password"))

  // check if we have valid form data
  if (!email || !username || !password) return new Response(JSON.stringify({ error: "Invalid form data." }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  })

  // generate random salt and then hash the password
  const salt = bcrypt.genSaltSync(Config.SaltRounds)
  const hash = bcrypt.hashSync(password, salt)

  // create the user in the database
  const prisma = new PrismaClient();
  const user = await prisma.user.create({
    data: {
      username,
      email,
      hash,
      salt,
    },
  });

  // return the user as a json response
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

}
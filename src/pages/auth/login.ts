import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Config } from '@asleepace/config'


// server-side rendering
export const prerender = false;

// constants
const headers = {
  'content-type': 'application/json',
}

const Errors = {
  InvalidEmail: JSON.stringify({ error: "Invalid email." }),
  InvalidPassword: JSON.stringify({ error: "Invalid password." }),
  NotFound: JSON.stringify({ error: "User not found." }),
}

// handle auth requests
export const post: APIRoute = async ({ params, request }) => {

  const { body, credentials, headers, formData } = request

  // extract the data from the request
  const data = await request.formData()
  const email = String(data.get("email"))
  const password = String(data.get("password"))

  console.log('[login.ts] email:', email, 'password:', password)

  // check if we have valid form data
  if (!email) return new Response(Errors.InvalidEmail, {
    status: 200,
    headers,
  })

  if (!password) return new Response(Errors.InvalidPassword, {
    status: 200,
    headers,
  })

  // check if the user exists in the database
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email }
  })

  console.log('[login.ts] user:', user)

  // if the user doesn't exist, return an error
  if (!user) return new Response(Errors.NotFound, {
    status: 200,
    headers,
  })

  // check if the password is correct

  const isPasswordCorrect = bcrypt.compareSync(password, user.hash)
  console.log('[login.ts] isPasswordCorrect:', isPasswordCorrect)

  // if the password dont't match, return an error
  if (!isPasswordCorrect) return new Response(Errors.NotFound, {
    status: 200,
    headers
  })

  // sanitize the user object
  const sanitizedUser = { ...user, hash: undefined, salt: undefined }
  delete sanitizedUser.hash
  delete sanitizedUser.salt
  const json = JSON.stringify(sanitizedUser)

  return new Response(json, {
    status: 200,
    headers
  })
}
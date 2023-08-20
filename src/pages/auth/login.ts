import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { b } from '../../../dist/server/chunks/astro.88a96b72.mjs';

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
export const get: APIRoute = async ({ params, request }) => {

  const { body, credentials, headers, formData } = request
  console.log('[login.ts] formData:', formData)
  console.log('[login.ts] body:', body)

  // check if the user exists in the database
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      email: ""
    }
  })

  // if the user doesn't exist, return an error
  if (!user) return new Response(Errors.NotFound, {
    status: 200,
    headers,
  })

  // check if the password is correct
  const password = "test"
  const hashPassword = bcrypt.hashSync(password, user.salt)
  const isPasswordCorrect = bcrypt.compareSync(hashPassword, user.hash)

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
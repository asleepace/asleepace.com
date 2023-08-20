import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// server-side rendering
export const prerender = false;

// handle auth requests
export const get: APIRoute = async ({ params, request }) => {

  const { body, credentials, headers, formData } = request
  console.log('[signup.ts] formData:', formData)
  console.log('[signup.ts] body:', body)

  const password = "test"

  // generate random salt and then hash the password
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds)
  const hash = bcrypt.hashSync(password, salt)

  // create the user in the database
  // const prisma = new PrismaClient();
  // const user = await prisma.user.create({
  //   data: {
  //     username: "",
  //     email: "",
  //     hash,
  //     salt,
  //   },
  // });


  return new Response(JSON.stringify({
    hash,
    salt,
    body,
    credentials,
    headers,
    formData,
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

}
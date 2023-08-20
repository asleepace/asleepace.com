import type { APIRoute } from 'astro';

// import NextAuth from "next-auth";
// import Providers from "next-auth/providers";
// import Adapters from "next-auth/adapters";
// import { getSession } from "next-auth/client";

import { PrismaClient } from "@prisma/client";

// server-side rendering
export const prerender = false;

// handle auth requests
export const get: APIRoute = async ({ params, request }) => {

  const cookie = request.headers.get('cookie');

  console.log('[auth.ts] params:', params)
  console.log('[auth.ts] request:', request)
  console.log('[auth.ts] credentials:', request.credentials)
  console.log('[auth.ts] body:', request.body)
  console.log('[auth.ts] text:', request.text)

  // const session = await getSession({ req: params.request });
  // const prisma = new PrismaClient();

  const body = JSON.stringify({
    referrer: request.referrer,
    credentials: request.credentials,
    headers: request.headers,
    body: request.body,
    text: request.text,
    url: request.url,
    method: request.method,
    integrity: request.integrity,
    cookie,
   });

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });

  // if (!link) {
  //   return new Response(null, {
  //     status: 404,
  //     statusText: 'Not found'
  //   });
  // }

  // return redirect(link, 307);
}
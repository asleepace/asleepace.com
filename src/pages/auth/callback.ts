import type { APIRoute } from 'astro';

export const prerender = false;

export type Props = {
  test: string
}

export const post: APIRoute = async (context) => {

  const { request, props, redirect, params } = context
  const { body, credentials, headers, formData } = request

  console.log('[oauth.ts] request:', request)

  return new Response("Hello World", {
    status: 200,
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
  })
}
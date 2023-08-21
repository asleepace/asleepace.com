import { sequence } from "astro/middleware";
import { defineMiddleware } from "astro/middleware";

// server-side rendering
export const prerender = false;

const handleLogging = defineMiddleware(({ cookies }, next) => {
  console.log("[middleware] cookies:", cookies)
  return next()
})

// handle processing form data
const handleFormData = defineMiddleware(async (context, next) => {
  // if (context.request.method !== 'POST') return next()
  // const data = await context.request.formData()
  // const body = [...data.entries()].reduce((output, [name, value]) => ({ ...output, [name]: value }), {})
  // console.log('[middleware] formData:', body)
  return next()
})

// handle user authentication
const handleAuthentication = defineMiddleware(async (context, next) => {
  // console.log("[middleware] auth context:", context)
  // console.log("[middleware] content:", context);
  // const response = await next();
  // console.log("[middleware] auth response:", response);
  return next()
})

export const onRequest = sequence(handleLogging, handleFormData, handleAuthentication);

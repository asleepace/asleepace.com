import { sequence } from "astro/middleware";
import { defineMiddleware } from "astro/middleware";

export const prerender = false;

const auth = defineMiddleware(async (context, next) => {
  console.log("[middleware] content:", context);
  const response = await next();
  console.log("[middleware] auth response:", response);
  return response;
})

export const onRequest = sequence(auth);

import type { RequestHandler } from "@builder.io/qwik-city";

export const onPost: RequestHandler = async ({ json, request }) => {
   console.log(JSON.stringify(request.headers));  
  json(200, { message: "Webhook received" });
};
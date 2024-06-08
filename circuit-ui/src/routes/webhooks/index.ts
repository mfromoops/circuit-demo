import type { RequestHandler } from "@builder.io/qwik-city";
import crypto, { sign } from "crypto";
export const onPost: RequestHandler = async ({ json, request, env }) => {
   console.log(JSON.stringify(request.headers));  
   const signature = request.headers.get("circuit-signature");
   if(!signature){
      json(401, { message: "Signature not found" });
      return;
   }
   const secret = env.get("CICRCUIT_SECRET_KEY") as string;
   const message = await request.text();
   console.log({ message });
   const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')
  console.log({ expectedSignature, signature });

  json(200, { message: "Webhook received" });
};
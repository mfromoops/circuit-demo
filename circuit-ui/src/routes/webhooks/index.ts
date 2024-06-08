import type { RequestHandler } from "@builder.io/qwik-city";
import cryptojs from "crypto-js";
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

   const expectedSignature = cryptojs.HmacSHA256(message, secret).toString();
  console.log({ expectedSignature, signature });

  json(200, { message: "Webhook received" });
};
import type { RequestHandler } from "@builder.io/qwik-city";
import cryptojs from "crypto-js";
import safeCompare from "safe-compare";
import { StopObject } from "~/business-logic/types";
type WebhookEvent = {
  type: "stop.allocated" | "stop.out_for_delivery" | "stop.attempted_delivery" | "test.send_event"
  version: string;
  created: number;
  data: StopObject;
};


export const onPost: RequestHandler = async ({ json, request, env }) => {
  console.log(JSON.stringify(request.headers));
  const signature = request.headers.get("circuit-signature");
  if (!signature) {
    json(401, { message: "Signature not found" });
    return;
  }

  const secret = env.get("CICRCUIT_SECRET_KEY") as string;
  const message = await request.text();
  const expectedSignature = cryptojs.HmacSHA256(message, secret).toString();
  if (!expectedSignature || expectedSignature.length !== signature.length) {
    json(401, { message: "Signature not found" });
    return;
  }
  

  const compareResult = safeCompare(expectedSignature, signature);
  if(!compareResult) {
    json(401, { message: "Signature not found" });
    return;
  }

  const data = JSON.parse(message) as WebhookEvent;
  const updatedItem = await handleStopAllocated(data.type, data.data);
  json(200, {
    message: "Webhook received",
    success: expectedSignature === signature,
    type: data.type,
    data: updatedItem,
  });
  return;
};

async function handleStopAllocated(type: WebhookEvent["type"], data: WebhookEvent["data"]) {
   const updateItem = {} as Record<string, any>;
   console.log({ type, data });
   if(type === "stop.attempted_delivery") {
      if(data.deliveryInfo.signatureUrl) {
         updateItem.signatureUrl = data.deliveryInfo.signatureUrl;
      }
      if(data.deliveryInfo.photoUrls) {
         updateItem.photoUrls = JSON.stringify(data.deliveryInfo.photoUrls);
      }
   }
   return updateItem;
   
}
